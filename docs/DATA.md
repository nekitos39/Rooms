\# DATA — Модель данных и формат JSON



\## Сущности



\### Room (аудитория)



| Поле | Тип | Описание |

|------|-----|----------|

| `id` | string | Уникальный идентификатор |

| `code` | string | Номер аудитории (например, «101») |

| `name` | string | Название |

| `capacity` | number | Вместимость |

| `equipment` | string\[] | Список оборудования (`projector`, `whiteboard`, `wifi`, ...) |

| `status` | enum | `available` \\| `booked` \\| `maintenance` |



\### Asset (единица инвентаря)



| Поле | Тип | Описание |

|------|-----|----------|

| `id` | string | Уникальный идентификатор |

| `name` | string | Название |

| `inventoryCode` | string | Инвентарный номер |

| `status` | enum | `available` \\| `in\_use` \\| `maintenance` \\| `retired` |



\### Booking (бронь)



| Поле | Тип | Описание |

|------|-----|----------|

| `id` | string | Уникальный идентификатор |

| `title` | string | Название брони |

| `startTime` | string | RFC 3339 / ISO 8601 в UTC |

| `endTime` | string | RFC 3339 / ISO 8601 в UTC |

| `notes` | string? | Заметки (опционально) |

| `room` | RoomSummary | Ссылка на аудиторию |

| `user` | UserSummary | Ссылка на пользователя |



\### RoomSummary



| Поле | Тип |

|------|-----|

| `id` | string |

| `name` | string |

| `number` | string |



\### UserSummary



| Поле | Тип |

|------|-----|

| `id` | string |

| `email` | string |



\## Формат JSON-экспорта



```json

{

&#x20; "schemaVersion": "1.0",

&#x20; "exportedAt": "2025-09-05T08:00:00Z",

&#x20; "rooms": \[

&#x20;   {

&#x20;     "id": "r-101",

&#x20;     "code": "101",

&#x20;     "name": "Аудитория 101",

&#x20;     "capacity": 30,

&#x20;     "equipment": \["projector", "whiteboard"],

&#x20;     "status": "available"

&#x20;   }

&#x20; ],

&#x20; "assets": \[

&#x20;   {

&#x20;     "id": "a-proj-1",

&#x20;     "name": "Проектор Epson",

&#x20;     "inventoryCode": "PRJ-001",

&#x20;     "status": "available"

&#x20;   }

&#x20; ],

&#x20; "bookings": \[

&#x20;   {

&#x20;     "id": "b-1",

&#x20;     "title": "Семинар",

&#x20;     "startTime": "2025-09-05T08:00:00Z",

&#x20;     "endTime": "2025-09-05T09:30:00Z",

&#x20;     "notes": "Нужен HDMI",

&#x20;     "room": { "id": "r-101", "name": "Аудитория 101", "number": "101" },

&#x20;     "user": { "id": "u-1", "email": "admin@example.com" }

&#x20;   }

&#x20; ]

}

