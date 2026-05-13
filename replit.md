# FTCTV.Online

Новостной сайт FTCTV.Online с синхронизацией из Telegram, прямыми эфирами, панелью администратора и автоматической тёмной темой.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — запустить API сервер (порт 8080)
- `pnpm --filter @workspace/ftctv run dev` — запустить фронтенд (порт 19651)
- `pnpm run typecheck` — полная проверка типов
- `pnpm run build` — сборка всех пакетов
- `pnpm --filter @workspace/api-spec run codegen` — перегенерировать API хуки и Zod схемы
- `pnpm --filter @workspace/db run push` — применить изменения схемы БД
- Required env: `DATABASE_URL` — строка подключения к Postgres

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, wouter
- Font: Unbounded (Google Fonts)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (из OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI спецификация (источник истины)
- `lib/db/src/schema/` — схема базы данных (posts, settings, livestream)
- `artifacts/api-server/src/routes/` — API маршруты
- `artifacts/ftctv/src/` — фронтенд React

## Architecture decisions

- Telegram Bot Token зашит в бэкенд (`8797996336:AAHV9B4xUfQczTKF9TctQJ5lvwOUeFu4r0M`), настраивается через Admin панель
- Пароль администратора: `Ftc!_9AdMin#2026_xZq` — хранится на сервере, токен возвращается клиенту и сохраняется в localStorage
- Автосинхронизация с Telegram: каждые 5 минут через getUpdates API
- Тёмная тема автоматически 22:00–06:00 по локальному времени пользователя
- Техобслуживание: каждое 18-е число месяца с 00:00 до 06:00 UTC+7

## Product

- Главная страница с новостной лентой, поиском и пагинацией
- Страница поста с видеоплеером, галереей и полным текстом
- Страница прямого эфира (YouTube/VK/Telegram)
- Панель администратора: посты, эфир, Telegram-синхронизация, настройки
- Заглушка на техобслуживание с таймером обратного отсчёта

## User preferences

- Шрифт: Unbounded
- Цвета: белый фон, тёмно-серые и фиолетовые элементы
- Без эмодзи в UI и в постах
- Тема поста выделяется жирным
- Логотип: /logo.png, высота ~44px в хедере
- Футер: "FTC CREATE PRODUCTION 2026. Все права защищены." + ftcmedia@mail.com

## Gotchas

- После изменения openapi.yaml обязательно запустить codegen перед использованием новых типов
- Telegram getUpdates работает только для сообщений, отправленных боту напрямую или в каналах, где бот является администратором
- Заглушка техобслуживания рассчитывается на сервере в UTC+7 (не зависит от клиента)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
