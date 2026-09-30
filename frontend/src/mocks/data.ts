import type { RoomsResponseDto } from "@/api/roomsApi";
import type { BookingDto } from "@/api/bookingsApi";
import type { AssetsResponseDto } from "@/types/assets";

export const roomsPayload: RoomsResponseDto = {
  items: [
    { id: "201", code: "201", name: "Конференц-зал", capacity: 50, equipment: ["projector","microphone","wifi"], status: "available" },
    { id: "101", code: "101", name: "Лекционная аудитория", capacity: 120, equipment: ["projector","wifi"], status: "available" },
    { id: "102", code: "102", name: "Компьютерный класс", capacity: 30, equipment: ["computers","projector","board","wifi"], status: "booked" },
    { id: "202", code: "202", name: "Семинарская", capacity: 25, equipment: ["board","wifi"], status: "maintenance" },
  ],
  page: 1,
  total: 4,
};

export const assetsPayload: AssetsResponseDto = {
  items: [
    { id: "a-1", name: "Проектор Epson", inventoryCode: "PRJ-001", status: "available" },
    { id: "a-2", name: "Проектор BenQ", inventoryCode: "PRJ-002", status: "in_use" },
    { id: "a-3", name: "Камера Sony", inventoryCode: "CAM-001", status: "available" },
    { id: "a-4", name: "Микрофон Shure", inventoryCode: "MIC-001", status: "maintenance" },
  ],
  page: 1,
  total: 4,
};

export const bookingsPayload: BookingDto[] = [
  {
    id: "b-1",
    title: "Семинар по ИС",
    startTime: "2025-12-15T08:00:00.000Z",
    endTime: "2025-12-15T09:30:00.000Z",
    notes: "Нужен HDMI",
    room: { id: "201", name: "Конференц-зал", number: "201" },
    user: { id: "u-1", email: "admin@example.com" },
  },
  {
    id: "b-2",
    title: "Лекция по математике",
    startTime: "2025-12-15T10:00:00.000Z",
    endTime: "2025-12-15T11:30:00.000Z",
    room: { id: "101", name: "Лекционная аудитория", number: "101" },
    user: { id: "u-1", email: "admin@example.com" },
  },
];