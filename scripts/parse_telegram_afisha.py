#!/usr/bin/env python3
"""
Telegram Afisha Parser
Scrapes public Telegram channels via t.me/s/ and inserts events into afisha_events.
"""

import re
import sys
import json
import hashlib
import os
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

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads", "afisha")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def download_image(url):
    """Download image from URL, save locally, return local path or None."""
    if not url:
        return None
    try:
        url_hash = hashlib.md5(url.encode()).hexdigest()
        # Determine extension
        ext = ".jpg"
        if ".png" in url.lower():
            ext = ".png"
        elif ".webp" in url.lower():
            ext = ".webp"
        filename = f"{url_hash}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        # Skip if already downloaded
        if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
            return f"/uploads/afisha/{filename}"

        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) < 500:
                return None
            with open(filepath, "wb") as f:
                f.write(data)
        print(f"    [IMG] Saved {filename} ({len(data)} bytes)")
        return f"/uploads/afisha/{filename}"
    except Exception as e:
        print(f"    [IMG WARN] Failed to download {url[:80]}: {e}")
        return None


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
    """Extract time from 🕓 marker, text patterns or bare time."""
    # 1. 🕓 marker
    m = re.search(r"🕓\s*(\d{1,2})[:\.](\d{2})", text)
    if m:
        return int(m.group(1)), int(m.group(2))

    # 2. Text patterns: Начало в, Когда:, Время:, Во сколько:
    m = re.search(r"(?:Начало\s+в|Когда\s*[:—–-]|Время\s*[:—–-]|Во сколько\s*[:—–-]|В\s)?\s*(\d{1,2})[:\.](\d{2})", text, re.IGNORECASE)
    if m:
        h = int(m.group(1))
        if 6 <= h <= 23:
            return h, int(m.group(2))

    # 3. Bare HH:MM
    m = re.search(r"(\d{1,2}):(\d{2})", text)
    if m:
        h = int(m.group(1))
        if 0 <= h <= 23:
            return h, int(m.group(2))
    return None, None


def parse_place(text):
    """Extract place from 📍 marker or text patterns like Где:, Место:."""
    raw = None

    # 1. Try 📍 marker
    m = re.search(r"📍\s*(.+?)(?:\n|💰|🕓|#|Подписывайся|$)", text, re.DOTALL)
    if m:
        raw = m.group(1).strip()

    # 2. Try text patterns: Где:, Место:, Площадка:, Адрес:
    if not raw:
        m = re.search(r"(?:Где|Место|Площадка|Локация|Адрес)\s*[:—–-]\s*(.+?)(?:\n|💰|🕓|📅|🗓|#|Подписывайся|Когда|Стоимость|Цена|Вход|$)", text, re.IGNORECASE | re.DOTALL)
        if m:
            raw = m.group(1).strip()

    if not raw:
        return None, None

    place = strip_html(raw).strip()
    # Clean truncated/mismatched quotes
    place = re.sub(r'^[«»"„"\s]+|[«»"„"\s]+$', '', place).strip()
    # Strip leftover field prefixes (e.g. "ГДЕ: Драмтеатр" → "Драмтеатр")
    place = re.sub(r'^(?:Где|Место|Площадка|Локация|Адрес)\s*[:—–-]\s*', '', place, flags=re.IGNORECASE).strip()
    if not place:
        return None, None

    # Split into name and address
    # Pattern: "Name (address)" or "Name, ул. Address"
    parts = re.split(r"\s*\(", place, maxsplit=1)
    if len(parts) > 1:
        name = parts[0].strip()
        addr = parts[1].rstrip(")").strip()
        if name:
            return name[:300], addr[:500] if addr else None

    # Try comma-separated: "Name, ул. Ленина 10"
    addr_m = re.search(r",\s*((?:ул\.|пр\.|пер\.|наб\.|б-р|бульвар|просп|пл\.|проспект|улица)\.?\s*.+)$", place, re.IGNORECASE)
    if addr_m:
        name = place[:addr_m.start()].strip()
        addr = addr_m.group(1).strip()
        if name:
            return name[:300], addr[:500]

    return place[:300], None


def parse_price(text):
    """Extract price from 💰 marker or text patterns like Стоимость:, Цена:, Вход:."""
    # 1. Try 💰 marker
    m = re.search(r"💰\s*(.+?)(?:\n|#|Подписывайся|📱|$)", text, re.DOTALL)
    if m:
        price = strip_html(m.group(1)).strip()
        if price:
            return price[:200]

    # 2. Try text patterns
    m = re.search(r"(?:Стоимость|Цена|Вход|Билет[ыь]?)\s*[:—–-]\s*(.+?)(?:\n|#|Подписывайся|📱|Где|Место|$)", text, re.IGNORECASE | re.DOTALL)
    if m:
        price = strip_html(m.group(1)).strip()
        # Remove trailing URLs/links
        price = re.sub(r"https?://\S+", "", price).strip()
        if price:
            return price[:200]

    # 3. Look for "бесплатно" / "вход свободный"
    if re.search(r"бесплатно|вход свободный|free", text, re.IGNORECASE):
        return "Бесплатно"

    # 4. Look for "xxx ₽" or "xxx руб"
    m = re.search(r"(\d[\d\s]*(?:₽|руб[^\w])[^#\n]*)", text)
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

    # 1. Try bold text first (<b>Title</b>)
    bold_m = re.search(r"<b>(.*?)</b>", text)
    if bold_m:
        bold_text = strip_html(bold_m.group(1)).strip()
        if 3 < len(bold_text) < 200:
            return bold_text[:500]

    # 2. Try quoted title: «Title» or "Title"
    m = re.search(r"[«\"](.*?)[»\"]", clean)
    if m:
        title_part = m.group(1).strip()
        # Also look for prefix like "Спектакль «Title»"
        event_types = r"Спектакль|Концерт|Выставка|Фестиваль|Мастер-класс|Встреча|Вечеринка|Шоу|Лекция|Квиз|Форум|Мюзикл|Опера|Балет|Экскурсия|Кинопоказ|Премьера"
        prefix_m = re.search(r"((?:" + event_types + r")\s+[«\"]" + re.escape(title_part) + r"[»\"])", clean)
        if prefix_m:
            return prefix_m.group(1).strip()[:500]
        return title_part[:500]

    # 3. Try line starting with event-type keyword
    lines = [l.strip() for l in clean.split("\n") if l.strip()]
    event_kw = re.compile(r"^(Спектакль|Концерт|Выставка|Фестиваль|Мастер-класс|Встреча|Вечеринка|Шоу|Лекция|Квиз|Форум|Экскурсия|Кинопоказ|Премьера)\b", re.I)
    for line in lines:
        if event_kw.match(line) and len(line) < 200:
            return line[:500]

    # 4. Fallback: first short title-like line (10-150 chars), skip markers
    skip_re = re.compile(r"^(🗓️|🕓|📍|💰|📱|🎫|🔞|#|Подписывайся|http|Билеты|Цена|Стоимость|Вход|Начало|Место|Адрес|Где:)", re.I)
    for line in lines:
        if skip_re.match(line):
            continue
        if 5 < len(line) < 150 and not line.startswith("http"):
            return line[:500]

    # 5. Last resort: first 100 chars
    return clean[:100].strip() if clean else "Событие"


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

        lower_text = clean_text.lower()

        # Hard ad markers — always skip
        ad_hard = [
            "реклама", "рекламн", "#реклама", "#ad", "партнёрский материал",
            "партнерский материал", "erid:", "erid :", "токен:", "оплаченная публикация",
        ]
        if any(kw in lower_text for kw in ad_hard):
            continue

        # Soft ad markers — skip if 2+ match (likely promo, not event)
        ad_soft = [
            "подпишись", "розыгрыш", "разыгрыва", "конкурс репост",
            "doma-dv", "строительная компания", "ипотек", "каталог",
            "скидк", "промокод", "promo", "акция действует",
            "закажи", "доставк", "оформи заявку", "оставь заявку",
            "успей купить", "только сегодня", "переходи по ссылке",
            "жми на кнопку", "регистрируйся по", "забронируй",
            "установи приложение", "скачай приложение",
            "кредит", "займ", "вклад под", "инвестиц",
            "казино", "ставки на спорт", "1xbet", "1хбет",
            "похудеть", "заработок", "пассивный доход",
            "бесплатный вебинар по заработку", "криптовалют",
            "продаётся", "продается", "сдаётся", "сдается",
            "аренда квартир", "купить квартир",
        ]
        soft_count = sum(1 for kw in ad_soft if kw in lower_text)
        if soft_count >= 2:
            continue

        # Skip pure reposts / forwards without event content
        if not any(sig in lower_text for sig in [
            "концерт", "спектакль", "выставк", "фестивал", "мастер-класс",
            "лекция", "квиз", "кино", "экскурс", "матч", "турнир",
            "встреча", "вечеринк", "шоу", "премьер", "открыти",
            "📍", "💰", "🕓", "🗓", "когда", "где:", "место:", "вход",
            "стоимость", "цена", "билет", "начало в",
        ]):
            # No event signals at all — likely not an event
            if soft_count >= 1:
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

        # Build description — remove structural markers, hashtags, promo tails
        description = re.sub(r"#\S+", "", clean_text).strip()
        description = re.sub(r"Подписывайся.*$", "", description, flags=re.DOTALL).strip()
        # Remove lines that are just field markers (already extracted into separate fields)
        desc_lines = []
        skip_patterns = re.compile(
            r"^\s*(?:📍|💰|🕓|🗓️?|📱|🎫|🔞)\s*",
        )
        field_patterns = re.compile(
            r"^\s*(?:Где|Место|Площадка|Локация|Адрес|Когда|Дата|Время|Начало|Стоимость|Цена|Вход|Билет[ыь]?|Во сколько)\s*[:—–-]",
            re.IGNORECASE
        )
        for line in description.split("\n"):
            stripped = line.strip()
            if not stripped:
                continue
            if skip_patterns.match(stripped):
                continue
            if field_patterns.match(stripped):
                continue
            desc_lines.append(stripped)
        description = "\n".join(desc_lines).strip()

        source_id = f"tg:{post_id}"
        event_url = f"https://t.me/{post_id}"

        events.append({
            "title": title,
            "description": description[:2000],
            "body_text": description[:5000],
            "image_url": download_image(image_url),
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
                    body_text=VALUES(body_text),
                    image_url=COALESCE(VALUES(image_url), image_url),
                    date_start=VALUES(date_start),
                    place_name=COALESCE(VALUES(place_name), place_name),
                    place_address=COALESCE(VALUES(place_address), place_address),
                    price=COALESCE(VALUES(price), price),
                    category=VALUES(category),
                    is_free=VALUES(is_free),
                    age_restriction=COALESCE(VALUES(age_restriction), age_restriction),
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
