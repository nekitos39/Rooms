\# Итоговое задание — Frontend + Backend + CI/CD



\## Ссылка на GitHub



https://github.com/nekitos39/Rooms



\*\*Frontend на GitHub Pages:\*\* https://nekitos39.github.io/Rooms/



\## Что сделано во фронтенде



\*\*Стек:\*\* React 19 + TypeScript 5.9 + Vite 7 + MUI 7 + axios + MSW 2 + clsx.



\*\*Подход к разработке:\*\*

\- Компонентный подход (React-хуки, функциональные компоненты).

\- Строгая типизация (TypeScript, strict mode).

\- Организация файлов — `folder-by-type`: `api/`, `Components/`, `context/`, `mocks/`, `types/`, `utils/`.

\- CSS-модули для глобальных стилей + MUI `sx` для локальных.

\- Mock-слой (\*\*MSW\*\*) перехватывает HTTP-запросы на уровне Service Worker — компоненты не знают, что работают с моками.



\*\*Функциональность:\*\*

\- Каталог аудиторий (поиск, фильтр по вместимости).

\- Каталог инвентаря (поиск по названию и коду).

\- Создание/редактирование/удаление броней с проверкой пересечений.

\- Импорт/экспорт JSON с валидацией.

\- Время в UTC, отображение в локальной таймзоне.



\*\*Зависимости (production):\*\* `react`, `react-dom`, `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `axios`, `clsx`, `msw`.



\*\*Dev:\*\* `vite`, `typescript`, `@vitejs/plugin-react`, `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`.



\## Что сделано в бэкенде



\*\*Стек:\*\* Fastify 5 + TypeScript + Prisma 6 + PostgreSQL 17.



\*\*Подход к разработке:\*\*

\- Fastify как HTTP-фреймворк — быстрый, с TypeBox для схем.

\- Prisma как ORM — типобезопасные запросы, миграции.

\- Плагины: `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit`, `@fastify/swagger`.

\- Обработка ошибок в формате \*\*RFC 7807 (Problem Details)\*\*.

\- Все ответы — JSON, описаны контрактами в `types.ts`.



\*\*Функциональность:\*\*

\- `GET /api/rooms`, `POST /api/rooms` — аудитории.

\- `GET /api/bookings`, `POST /api/bookings`, `PATCH /api/bookings/:id`, `DELETE /api/bookings/:id` — брони.

\- `GET /api/users` — пользователи.

\- `GET /api/health` — health check.

\- `GET /openapi.json` — OpenAPI-спека.



\*\*Особенности:\*\*

\- Проверка пересечений на сервере (SQL-запрос по `startTime < newEnd \&\& endTime > newStart`).

\- Транзакции Prisma при удалении брони.

\- CORS настроен для `nekitos39.github.io` и `localhost`.



\*\*Зависимости (production):\*\* `fastify`, `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit`, `@fastify/swagger`, `@fastify/type-provider-typebox`, `@prisma/client`, `prisma`, `typebox`.



\*\*Dev:\*\* `@types/node`, `ts-node`, `typescript`.



\## Как настроен CI/CD



\*\*GitHub Actions, два workflow:\*\*



\### 1. `backend-ci.yml`



\*\*Триггер:\*\* push/PR в `main`, изменения в `backend/\*\*`.



\*\*Шаги:\*\*

1\. Checkout.

2\. Setup Node 20.

3\. `npm ci` в `backend/`.



\*\*Статус:\*\* ✅ проходит.



\### 2. `frontend.yml`



\*\*Триггер:\*\* push/PR в `main`, изменения в `frontend/\*\*`.



\*\*Шаги:\*\*

1\. \*\*Job build:\*\*

&#x20;  - Checkout.

&#x20;  - Setup Node 20 + cache npm.

&#x20;  - `npm ci` в `frontend/`.

&#x20;  - `npm run build -- --base=/Rooms/` (base path для Pages).

&#x20;  - Upload artifact (папка `frontend/dist`) в Pages.

2\. \*\*Job deploy:\*\*

&#x20;  - Деплой артефакта на GitHub Pages.



\*\*Особенности:\*\*

\- `concurrency: frontend-pages` — не запускать два деплоя одновременно.

\- `permissions: pages: write, id-token: write` — для деплоя.

\- MSW работает на Pages: `serviceWorker.url` использует `import.meta.env.BASE\_URL` → `/Rooms/mockServiceWorker.js`.



\*\*Статус:\*\* ✅ работает, сайт доступен на https://nekitos39.github.io/Rooms/.



\## Что было интереснее всего



\*\*MSW (Mock Service Worker).\*\* Это инструмент, который перехватывает HTTP-запросы через Service Worker и возвращает мок-ответы. Компоненты при этом \*\*не знают\*\*, что работают не с реальным backend — они делают обычные axios-запросы.



Это даёт:

\- Возможность разрабатывать frontend \*\*до\*\* готовности backend.

\- Тесты и демо без backend.

\- \*\*Лёгкий переход на реальный API\*\* — просто убрать `worker.start()`.



Планирую развиваться в этом направлении: писать контрактные тесты, использовать MSW для E2E, моделировать сложные сценарии.



Также интересно было \*\*работать с UTC и локальными таймзонами\*\* — понимание, что все вычисления пересечений надо делать в UTC, пришло не сразу.



\## Пожелания по курсу



1\. \*\*Больше про IndexedDB\*\* — в ТЗ она рекомендуется, но в курсе не разбиралась. Хотелось бы примеров использования.

2\. \*\*Больше про MSW\*\* — очень полезный инструмент, но в курсе не упоминался.

3\. \*\*Разбор работы с временем и локалями\*\* — типичные ошибки (летнее/зимнее время, разные форматы, `toISOString()` vs `toLocaleString()`).

4\. \*\*Примеры CI/CD для frontend\*\* — деплой на GitHub Pages, кэширование npm, работа с base path.

5\. \*\*Больше про тестирование\*\* — Vitest, Testing Library, интеграционные тесты.

6\. \*\*Разбор типичных ошибок в Docker Compose\*\* — override-файлы, монтирование томов, работа с Windows-путями.



В целом курс был полезен, особенно практические задания с реальными требованиями (кроссплатформенность, документация, CI/CD).

