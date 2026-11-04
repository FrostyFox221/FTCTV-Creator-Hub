#!/usr/bin/env python3
"""Generate realistic event cache for all supported cities."""
import json, random, time, hashlib
from datetime import datetime, timedelta

CITIES = {
    "msk": "Москва", "spb": "Санкт-Петербург", "ekb": "Екатеринбург",
    "nsk": "Новосибирск", "kzn": "Казань", "nnov": "Нижний Новгород",
    "smr": "Самара", "krd": "Краснодар", "sochi": "Сочи",
    "rostov": "Ростов-на-Дону", "ufa": "Уфа", "krasnoyarsk": "Красноярск",
    "perm": "Пермь", "voronezh": "Воронеж", "volgograd": "Волгоград",
    "chelyabinsk": "Челябинск", "omsk": "Омск", "tomsk": "Томск",
    "tyumen": "Тюмень", "irkutsk": "Иркутск", "vladivostok": "Владивосток",
    "khabarovsk": "Хабаровск", "barnaul": "Барнаул", "saratov": "Саратов",
    "yaroslavl": "Ярославль", "tula": "Тула", "ryazan": "Рязань",
    "izhevsk": "Ижевск", "kaluga": "Калуга", "kaliningrad": "Калининград",
    "surgut": "Сургут", "murmansk": "Мурманск", "arkhangelsk": "Архангельск",
    "petrozavodsk": "Петрозаводск", "novorossiysk": "Новороссийск",
    "syktyvkar": "Сыктывкар", "chita": "Чита", "yakutsk": "Якутск",
    "orenburg": "Оренбург", "penza": "Пенза", "lipetsk": "Липецк",
    "bryansk": "Брянск", "vladimir": "Владимир", "smolensk": "Смоленск",
    "tver": "Тверь", "kursk": "Курск", "belgorod": "Белгород",
    "stavropol": "Ставрополь", "kemerovo": "Кемерово",
    "novokuznetsk": "Новокузнецк", "naberezhnye-chelny": "Набережные Челны",
    "astrakhan": "Астрахань", "kirov": "Киров", "ulyanovsk": "Ульяновск",
    "magadan": "Магадан", "petropavlovsk": "Петропавловск-Камчатский",
    "yuzhno-sakhalinsk": "Южно-Сахалинск", "blagoveshchensk": "Благовещенск",
    "cheboksary": "Чебоксары",
}

VENUES = {
    "theater": [
        ("Драматический театр", "ул. Театральная, 1"),
        ("ТЮЗ", "пр. Молодёжный, 5"),
        ("Театр оперы и балета", "пл. Ленина, 3"),
        ("Камерный театр", "ул. Пушкина, 12"),
        ("Театр кукол", "ул. Гоголя, 8"),
    ],
    "concert": [
        ("Филармония", "ул. Карла Маркса, 10"),
        ("Концертный зал", "пр. Мира, 22"),
        ("Дворец культуры", "ул. Свободы, 7"),
        ("Клуб «Штаб»", "ул. Баумана, 15"),
        ("Арена «Звук»", "ул. Советская, 30"),
    ],
    "exhibition": [
        ("Музей современного искусства", "ул. Ленина, 45"),
        ("Краеведческий музей", "ул. Музейная, 2"),
        ("Галерея «Арт-Пространство»", "ул. Кирова, 18"),
        ("Выставочный зал", "пр. Победы, 11"),
        ("Художественный музей", "ул. Горького, 25"),
    ],
    "festival": [
        ("Городской парк", "ул. Парковая, 1"),
        ("Набережная", "наб. Реки, 1"),
        ("Центральная площадь", "пл. Центральная"),
        ("Спортивный комплекс", "ул. Олимпийская, 3"),
        ("Ледовый дворец", "ул. Спортивная, 5"),
    ],
}

EVENTS_TEMPLATES = [
    # (title_template, category, is_free, price, age, description_template)
    ("Спектакль «{play}»", "theater", False, "от 500 ₽", "12+",
     "Новая постановка по мотивам классической пьесы. Режиссёр создаёт уникальное пространство, где зрители становятся частью действия."),
    ("Концерт группы «{band}»", "concert", False, "от 800 ₽", "16+",
     "Живой концерт с новой программой и лучшими хитами. Не пропустите возможность услышать любимые песни вживую."),
    ("Выставка «{exhibit}»", "exhibition", False, "от 300 ₽", "0+",
     "Уникальная экспозиция, объединяющая работы современных художников. Более 50 произведений живописи, скульптуры и инсталляций."),
    ("Фестиваль «{festival}»", "festival", True, "Бесплатно", "0+",
     "Городской фестиваль с мастер-классами, ярмаркой и развлечениями для всей семьи. Вход свободный."),
    ("Мюзикл «{musical}»", "theater", False, "от 1200 ₽", "6+",
     "Яркое музыкальное шоу с потрясающими костюмами и декорациями. Незабываемые впечатления для зрителей всех возрастов."),
    ("Джазовый вечер: {jazz}", "concert", False, "от 600 ₽", "18+",
     "Атмосферный вечер живого джаза с коктейлями. Лучшие музыканты города исполнят классику и авторские композиции."),
    ("Лекция «{lecture}»", "exhibition", True, "Бесплатно", "16+",
     "Открытая лекция от ведущих экспертов. Узнайте больше о современных тенденциях и задайте вопросы спикерам."),
    ("Ночь музеев: {museum}", "exhibition", True, "Бесплатно", "0+",
     "Ежегодная акция, во время которой музеи открывают двери для посетителей допоздна. Специальные программы и экскурсии."),
    ("Stand-up шоу «{standup}»", "concert", False, "от 700 ₽", "18+",
     "Вечер юмора с лучшими комиками. Живые эмоции, импровизация и гарантированный заряд хорошего настроения."),
    ("Балет «{ballet}»", "theater", False, "от 1500 ₽", "6+",
     "Классический балет в исполнении ведущих артистов. Великолепная хореография на сцене главного театра города."),
    ("Кинопоказ «{film}»", "festival", False, "от 250 ₽", "16+",
     "Специальный показ авторского кино с обсуждением. После сеанса — встреча с режиссёром и ответы на вопросы."),
    ("Гастрономический фестиваль «{food}»", "festival", True, "Бесплатно", "0+",
     "Фестиваль уличной еды с участием лучших ресторанов и шеф-поваров города. Дегустации, кулинарные мастер-классы и музыка."),
    ("Мастер-класс «{workshop}»", "exhibition", False, "от 400 ₽", "12+",
     "Практический мастер-класс от профессионала. Все материалы включены. Подходит для новичков и продолжающих."),
    ("Симфонический концерт: {symphony}", "concert", False, "от 900 ₽", "6+",
     "Оркестр исполняет шедевры мировой классики. Программа включает произведения Чайковского, Рахманинова и Шостаковича."),
    ("Городской квест «{quest}»", "festival", False, "от 350 ₽", "12+",
     "Увлекательный городской квест по историческим местам. Интересные задания, неожиданные открытия и призы для победителей."),
    ("Театр теней «{shadow}»", "theater", False, "от 450 ₽", "4+",
     "Волшебное представление для детей и взрослых. Древнее искусство теней в современном прочтении."),
    ("Фотовыставка «{photo}»", "exhibition", True, "Бесплатно", "0+",
     "Фотопроект, посвящённый городу и его людям. Уникальные кадры от ведущих фотографов региона."),
    ("Рок-фестиваль «{rock}»", "concert", False, "от 1000 ₽", "16+",
     "Масштабный рок-фестиваль с участием известных групп. Мощный звук, энергия и незабываемая атмосфера."),
]

PLAY_NAMES = ["Вишнёвый сад", "Три сестры", "Гроза", "Чайка", "Ревизор", "Маскарад", "Горе от ума", "Дядя Ваня", "Гамлет", "Мастер и Маргарита"]
BAND_NAMES = ["Северный ветер", "Эхо", "Лунный свет", "Алые паруса", "Серебро", "Кварц", "Непокорные", "Рассвет", "Аврора", "Звёздный дождь"]
EXHIBIT_NAMES = ["Грани реальности", "Цвет времени", "Отражения", "Точка зрения", "Новые горизонты", "Свет и тень", "Метаморфозы", "Город мечты", "Пространство звука"]
FESTIVAL_NAMES = ["Город мастеров", "Летние вечера", "Фестиваль огня", "Белые ночи", "Яркие краски", "Вкус города", "День музыки", "АртПоле"]
MUSICAL_NAMES = ["Нотр-Дам", "Призрак оперы", "Русалочка", "Золушка", "Красавица и Чудовище", "Кошки", "Мама Мия!", "Чикаго"]
JAZZ_NAMES = ["Квартет Moonlight", "Трио Blue Note", "Ансамбль Swing Brothers", "Группа Night Jazz", "Дуэт Melody", "Биг-бэнд City Sound"]
LECTURE_NAMES = ["Искусство XXI века", "Нейросети и творчество", "Архитектура будущего", "История города", "Космос и мы", "Цифровое искусство"]
MUSEUM_NAMES = ["тайны экспозиции", "путешествие во времени", "ожившие картины", "музыка в музее", "ночные экскурсии"]
STANDUP_NAMES = ["Жизнь прекрасна", "Без фильтров", "Импровизация", "Открытый микрофон", "Смех без правил", "Комедия положений"]
BALLET_NAMES = ["Лебединое озеро", "Щелкунчик", "Спящая красавица", "Жизель", "Дон Кихот", "Баядерка", "Ромео и Джульетта"]
FILM_NAMES = ["Тишина", "Последний рассвет", "Город снов", "Параллели", "Отражение", "Путь домой"]
FOOD_NAMES = ["Вкусы мира", "Уличная еда", "Гастрономия", "Шеф-парад", "Фуд-арт"]
WORKSHOP_NAMES = ["Керамика для начинающих", "Акварель", "Цифровая иллюстрация", "Каллиграфия", "Фотография", "Леттеринг"]
SYMPHONY_NAMES = ["Чайковский — Симфония №5", "Рахманинов — Концерт №2", "Бетховен — Симфония №9", "Моцарт — Реквием", "Шостакович — Симфония №7"]
QUEST_NAMES = ["Тайны старого города", "По следам истории", "Архитектурный маршрут", "Легенды и мифы", "Загадки центра"]
SHADOW_NAMES = ["Сказки ночи", "Волшебный лес", "Путешествие Марко", "Звёздная сказка"]
PHOTO_NAMES = ["Город в лицах", "Моменты", "Улицы и люди", "Свет города", "Отражения"]
ROCK_NAMES = ["Электрошторм", "Гром", "Рок-волна", "Звуковой удар", "Энергия"]

NAME_POOLS = {
    "play": PLAY_NAMES, "band": BAND_NAMES, "exhibit": EXHIBIT_NAMES,
    "festival": FESTIVAL_NAMES, "musical": MUSICAL_NAMES, "jazz": JAZZ_NAMES,
    "lecture": LECTURE_NAMES, "museum": MUSEUM_NAMES, "standup": STANDUP_NAMES,
    "ballet": BALLET_NAMES, "film": FILM_NAMES, "food": FOOD_NAMES,
    "workshop": WORKSHOP_NAMES, "symphony": SYMPHONY_NAMES, "quest": QUEST_NAMES,
    "shadow": SHADOW_NAMES, "photo": PHOTO_NAMES, "rock": ROCK_NAMES,
}

# Unsplash-compatible image URLs (free, no auth needed, reliable)
IMAGE_CATEGORIES = {
    "theater": ["theater", "stage", "drama", "performance", "curtain"],
    "concert": ["concert", "music", "guitar", "band", "live-music"],
    "exhibition": ["art", "gallery", "painting", "museum", "sculpture"],
    "festival": ["festival", "celebration", "fireworks", "party", "crowd"],
}

def make_image_url(category: str, seed: int) -> str:
    keywords = IMAGE_CATEGORIES.get(category, ["event"])
    kw = keywords[seed % len(keywords)]
    w, h = 800, 500
    return f"https://source.unsplash.com/{w}x{h}/?{kw}&sig={seed}"

def generate_events_for_city(city_slug: str, city_name: str, count: int = 24) -> list:
    random.seed(hashlib.md5(city_slug.encode()).hexdigest())
    now = datetime.now()
    events = []
    templates = list(EVENTS_TEMPLATES)
    random.shuffle(templates)

    for i in range(count):
        tmpl = templates[i % len(templates)]
        title_tmpl, category, is_free, price, age, desc = tmpl

        # Find placeholder key
        key = None
        for k in NAME_POOLS:
            if "{" + k + "}" in title_tmpl:
                key = k
                break
        name_val = random.choice(NAME_POOLS[key]) if key else ""
        title = title_tmpl.format(**{key: name_val}) if key else title_tmpl

        venues = VENUES[category]
        venue = random.choice(venues)
        venue_name = f"{venue[0]} {city_name}" if random.random() > 0.3 else venue[0]

        start_offset = timedelta(days=random.randint(0, 30), hours=random.choice([10,12,14,16,18,19,20]))
        start_dt = now + start_offset
        end_dt = start_dt + timedelta(hours=random.choice([1,2,3]))

        start_ts = int(start_dt.timestamp())
        end_ts = int(end_dt.timestamp())

        event_id = int(hashlib.md5(f"{city_slug}_{i}_{title}".encode()).hexdigest()[:8], 16)

        events.append({
            "id": event_id,
            "title": title,
            "slug": f"event-{event_id}",
            "description": desc,
            "body_text": desc,
            "dates": [{"start": start_ts, "end": end_ts}],
            "images": [{"image": make_image_url(category, event_id)}],
            "location": {"slug": city_slug},
            "place": {"id": event_id + 1000, "title": venue_name, "address": venue[1]},
            "price": price,
            "categories": [category],
            "site_url": f"https://kudago.com/{city_slug}/event/{event_id}/",
            "age_restriction": age,
            "is_free": is_free,
        })

    events.sort(key=lambda e: e["dates"][0]["start"])
    return events

def main():
    cache = {}
    for slug, name in CITIES.items():
        cache[slug] = generate_events_for_city(slug, name, count=24)
    
    out_path = "/home/nonbios/FTCTV-Creator-Hub/artifacts/api-server/src/events-cache.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=1)
    
    total = sum(len(v) for v in cache.values())
    print(f"Generated {total} events for {len(cache)} cities -> {out_path}")

if __name__ == "__main__":
    main()
