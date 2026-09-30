Room\&Assets



Информационная система для управления каталогом ресурсов (аудитории и инвентарь) и бронированиями. Все данные хранятся локально в браузере; перенос между устройствами — через экспорт/импорт JSON.



Стек



\- Fronten React 19 + TypeScript + Vite + MUI

\- HTTP: axios

\- Моки: MSW (Mock Service Worker) — для работы без backend

\- Backend (опционально):\*\* Fastify + Prisma + PostgreSQL (папка `backend/`)

\- Стили: CSS-модули + MUI

\- Данные: localStorage (для броней) / in-memory в MSW



Быстрый запуск



Требования

\- Node.js 20.19+ или 22.12+

\- npm 10+



Установка и запуск

```bash

cd frontend

npm install

npm run dev

