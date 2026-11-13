#!/usr/bin/env python3
"""
Telegram Afisha Parser
Scrapes public Telegram channels via t.me/s/ and inserts events into afisha_events.
"""

import re
import sys
import json
import urllib.request
import urllib.error
import mysql.connector
from datetime import datetime, timedelta
from html import unescape

# ─── Config ───
DB_CONFIG = {
    "host": "localhost",
    "user": "afisha_parser",
    "password": "AfishaP4rs3r!",
    "database": "ftctv_db",
    "charset": "utf8mb4",
}

RUSSIAN_MONTHS = {
    "января": 1, "февраля": 2, "марта": 3, "апреля": 4,
    "мая": 5, "июня": 6, "июля": 7, "августа": 8,
    "сентября": 9, "октября": 10, "ноября": 11, "декабря": 12,
}

CATEGORY_KEYWORDS = {
    "concert": ["концерт", "группа", "выступление", "живая музыка", "sing band", "вечеринка"],
    "theater": ["спектакль", "театр", "драмтеатр", "постановка", "премьера"],
    "exhibition": ["выставк", "экспозиц", "галере"],
    "cinema": ["кино", "фильм", "кинотеатр", "показ"],
    "sport": ["спорт", "матч", "турнир", "соревнован", "хоккей", "футбол"],
    "education": ["лекция", "мастер-класс", "семинар", "тренинг", "образован", "встреча"],
    "kids": ["детям", "детск", "ребят", "мультфильм", "сказк"],
    "festival": ["фестивал", "праздни", "ярмарк"],
}


def fetch_channel(username):
    """Fetch public Telegram channel preview page."""
    url = f"https://t.me/s/{username}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except urllib.error.URLError as e:
        print(f"  [ERROR] Failed to fetch {url}: {e}")
        return None


def strip_html(text):
    """Remove HTML tags, decode entities."""
    text = re.sub(r"<br\s*/?>", "\n", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def parse_date_from_hashtags(text, post_date):
    """Extract date from hashtags like #13ноября2026."""
    m = re.search(r"#(\d{1,2})([а-яё]+)(\d{4})", text)
    if m:
        day = int(m.group(1))
        month_name = m.group(2)
        year = int(m.group(3))
        month = RUSSIAN_MONTHS.get(month_name)
        if month:
            try:
                return datetime(year, month, day)
            except ValueError:
                pass

    # Try emoji date: 🗓️ Пятница, 13 ноября
    m = re.search(r"(\d{1,2})\s+([а-яё]+)", text)
    if m:
        day = int(m.group(1))
        month = RUSSIAN_MONTHS.get(m.group(2))
        if month:
            year = post_date.year
            try:
                dt = datetime(year, month, day)
                # If date seems past, try next year
                if dt < post_date - timedelta(days=30):
                    dt = datetime(year + 1, month, day)
                return dt
            except ValueError:
                pass

    return post_date


def parse_time(text):
    """Extract time from 🕓 marker or text."""
    m = re.search(r"🕓\s*(\d{1,2})[:\.](\d{2})", text)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.search(r"(\d{1,2}):(\d{2})", text)
    if m:
        h = int(m.group(1))
        if 0 <= h <= 23:
            return h, int(m.group(2))
    return None, None


def parse_place(text):
    """Extract place from 📍 marker."""
    m = re.search(r"📍\s*(.+?)(?:\n|💰|🕓|#|Подписывайся|$)", text, re.DOTALL)
    if m:
        place = strip_html(m.group(1)).strip().strip("«»\"").strip()
        # Split into name and address if possible
        parts = re.split(r"\s*\(", place, maxsplit=1)
        name = parts[0].strip()
        addr = parts[1].rstrip(")").strip() if len(parts) > 1 else None
        return name[:300], addr[:500] if addr else None
    return None, None


def parse_price(text):
    """Extract price from 💰 marker."""
    m = re.search(r"💰\s*(.+?)(?:\n|#|Подписывайся|📱|$)", text, re.DOTALL)
    if m:
        price = strip_html(m.group(1)).strip()
        return price[:200]
    # Also look for "xxx ₽"
    m = re.search(r"(\d[\d\s]*₽[^#\n]*)", text)
    if m:
        return strip_html(m.group(1)).strip()[:200]
    return None


def parse_age(text):
    """Extract age restriction like (12+), (18+)."""
    m = re.search(r"\((\d+)\+\)", text)
    return m.group(0) if m else None


def detect_category(text):
    """Detect event category from text keywords."""
    lower = text.lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                return cat
    return "other"


def extract_title(text):
    """Extract a meaningful title from event text."""
    clean = strip_html(text)
    # Try to find quoted title: «Title» or "Title"
    m = re.search(r"[«\"](.*?)[»\"]", clean)
    if m:
        title_part = m.group(1).strip()
        # Also look for prefix like "Спектакль «Title»"
        prefix_m = re.search(r"((?:Спектакль|Концерт|Выставка|Фестиваль|Мастер-класс|Встреча|Вечеринка|Шоу|Лекция|Квиз)\s+[«\"]" + re.escape(title_part) + r"[»\"])", clean)
        if prefix_m:
            return prefix_m.group(1).strip()[:500]
        return title_part[:500]

    # Fallback: first meaningful line after date/time markers
    lines = [l.strip() for l in clean.split("\n") if l.strip()]
    for line in lines:
        # Skip lines that are just date/time/place markers
        if re.match(r"^(🗓️|🕓|📍|💰|📱|#|Подписывайся)", line):
            continue
        if len(line) > 10 and not line.startswith("http"):
            return line[:500]

    return clean[:100] if clean else "Событие"


def parse_channel_posts(html, channel_username, city_slug):
    """Parse all posts from channel HTML into event dicts."""
    events = []

    # Find each message block
    post_blocks = re.finditer(
        r'data-post="([^"]+)".*?'
        r'(?:tgme_widget_message_photo_wrap[^"]*?url\(\'(.*?)\'\))?'
        r'.*?(?:class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>)?'
        r'.*?<time[^>]*datetime="([^"]*)"',
        html, re.DOTALL
    )

    # Alternative: split by message wraps
    msg_pattern = re.compile(
        r'data-post="(?P<post_id>[^"]+)"(?P<block>.*?)(?=data-post="|$)',
        re.DOTALL
    )

    for match in msg_pattern.finditer(html):
        post_id = match.group("post_id")
        block = match.group("block")

        # Extract image
        img_m = re.search(r"url\('(https://[^']+)'\)", block)
        image_url = img_m.group(1) if img_m else None

        # Extract text
        text_m = re.search(r'class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', block, re.DOTALL)
        if not text_m:
            continue  # Skip posts without text
        raw_text = text_m.group(1)
        clean_text = strip_html(raw_text)

        # Skip ads and non-event posts
        if len(clean_text) < 30:
            continue
        if any(skip in clean_text.lower() for skip in ["реклама", "подпишись", "розыгрыш", "doma-dv", "строительная компания", "ипотеку", "каталог"]):
            continue

        # Extract post datetime
        time_m = re.search(r'<time[^>]*datetime="([^"]*)"', block)
        post_dt = datetime.fromisoformat(time_m.group(1).replace("+00:00", "+00:00")) if time_m else datetime.now()
        if hasattr(post_dt, 'tzinfo') and post_dt.tzinfo:
            post_dt = post_dt.replace(tzinfo=None)

        # Parse event fields
        event_date = parse_date_from_hashtags(clean_text, post_dt)
        hour, minute = parse_time(clean_text)
        if hour is not None:
            event_date = event_date.replace(hour=hour, minute=minute)

        title = extract_title(raw_text)
        place_name, place_addr = parse_place(clean_text)
        price = parse_price(clean_text)
        age = parse_age(clean_text)
        category = detect_category(clean_text)
        is_free = 1 if price and ("бесплатно" in price.lower() or "вход свободный" in price.lower()) else 0

        # Build description (clean text without hashtags)
        description = re.sub(r"#\S+", "", clean_text).strip()
        description = re.sub(r"Подписывайся.*$", "", description, flags=re.DOTALL).strip()

        source_id = f"tg:{post_id}"
        event_url = f"https://t.me/{post_id}"

        events.append({
            "title": title,
            "description": description[:2000],
            "body_text": description[:5000],
            "image_url": image_url,
            "date_start": event_date,
            "place_name": place_name,
            "place_address": place_addr,
            "city_slug": city_slug,
            "category": category,
            "price": price,
            "url": event_url,
            "source_post_id": source_id,
            "is_free": is_free,
            "age_restriction": age,
            "is_published": 1,
        })

    return events


def save_events(events, db):
    """Insert events into database, skip duplicates."""
    cursor = db.cursor()
    inserted = 0
    skipped = 0

    for ev in events:
        # Skip past events
        if ev["date_start"] < datetime.now() - timedelta(days=1):
            skipped += 1
            continue

        try:
            cursor.execute("""
                INSERT INTO afisha_events 
                    (title, description, body_text, image_url, date_start, 
                     place_name, place_address, city_slug, category, price, 
                     url, source_post_id, is_free, age_restriction, is_published)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    title=VALUES(title), description=VALUES(description),
                    image_url=VALUES(image_url), date_start=VALUES(date_start),
                    place_name=VALUES(place_name), price=VALUES(price),
                    updated_at=CURRENT_TIMESTAMP
            """, (
                ev["title"], ev["description"], ev["body_text"], ev["image_url"],
                ev["date_start"], ev["place_name"], ev["place_address"],
                ev["city_slug"], ev["category"], ev["price"], ev["url"],
                ev["source_post_id"], ev["is_free"], ev["age_restriction"],
                ev["is_published"],
            ))
            if cursor.rowcount == 1:
                inserted += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"  [WARN] Failed to insert event '{ev['title'][:50]}': {e}")
            skipped += 1

    db.commit()
    cursor.close()
    return inserted, skipped


def main():
    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] Telegram Afisha Parser started")

    db = mysql.connector.connect(**DB_CONFIG)
    cursor = db.cursor(dictionary=True)

    # Get active sources
    cursor.execute("SELECT * FROM afisha_sources WHERE is_active = 1")
    sources = cursor.fetchall()
    print(f"  Found {len(sources)} active source(s)")

    total_inserted = 0
    total_skipped = 0

    for src in sources:
        ch = src["channel_username"]
        city = src["city_slug"]
        print(f"\n  Parsing @{ch} → city={city}")

        html = fetch_channel(ch)
        if not html:
            continue

        events = parse_channel_posts(html, ch, city)
        print(f"  Extracted {len(events)} event(s)")

        if events:
            ins, skip = save_events(events, db)
            total_inserted += ins
            total_skipped += skip
            print(f"  Inserted: {ins}, Skipped/Updated: {skip}")

        # Update last_parsed_at
        cursor.execute(
            "UPDATE afisha_sources SET last_parsed_at = NOW() WHERE id = %s",
            (src["id"],)
        )
        db.commit()

    cursor.close()
    db.close()
    print(f"\n  TOTAL: {total_inserted} inserted, {total_skipped} skipped")
    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] Parser finished")


if __name__ == "__main__":
    main()
