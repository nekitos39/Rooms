import { http as msw, HttpResponse } from "msw";
import { roomsPayload, bookingsPayload, assetsPayload } from "./data";
import type { BookingDto } from "@/api/bookingsApi";

let bookings: BookingDto[] = [...bookingsPayload];

export const handlers = [
  // ===== ROOMS =====
  msw.get("/api/rooms", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    return HttpResponse.json({ ...roomsPayload, page });
  }),

  // ===== ASSETS =====
  msw.get("/api/assets", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    return HttpResponse.json({ ...assetsPayload, page });
  }),

  // ===== BOOKINGS =====
  msw.get("/api/bookings", () => HttpResponse.json(bookings)),

  msw.post("/api/bookings", async ({ request }) => {
    const body = (await request.json()) as any;
    const room = roomsPayload.items.find((r) => r.id === body.roomId);

    const hasConflict = bookings.some(
      (b) =>
        b.room.id === body.roomId &&
        new Date(body.startTime) < new Date(b.endTime) &&
        new Date(body.endTime) > new Date(b.startTime)
    );

    if (hasConflict) {
      return HttpResponse.json(
        { message: "Время занято. Выберите другой временной интервал." },
        { status: 409 }
      );
    }

    const newBooking: BookingDto = {
      id: `b-${Date.now()}`,
      title: body.title,
      startTime: body.startTime,
      endTime: body.endTime,
      notes: body.notes,
      room: room
        ? { id: room.id, name: room.name, number: room.code }
        : { id: body.roomId, name: "Unknown", number: "" },
      user: { id: body.userId ?? "u-1", email: "admin@example.com" },
    };

    bookings.push(newBooking);
    return HttpResponse.json(newBooking, { status: 201 });
  }),

  msw.patch("/api/bookings/:id", async ({ params, request }) => {
    const { id } = params as { id: string };
    const body = (await request.json()) as any;
    const index = bookings.findIndex((b) => b.id === id);

    if (index === -1) {
      return HttpResponse.json({ message: "Бронь не найдена" }, { status: 404 });
    }

    const current = bookings[index];

    const hasConflict = bookings.some(
      (b) =>
        b.id !== id &&
        b.room.id === current.room.id &&
        new Date(body.startTime ?? current.startTime) < new Date(b.endTime) &&
        new Date(body.endTime ?? current.endTime) > new Date(b.startTime)
    );

    if (hasConflict) {
      return HttpResponse.json(
        { message: "Время занято. Выберите другой временной интервал." },
        { status: 409 }
      );
    }

    bookings[index] = {
      ...current,
      title: body.title ?? current.title,
      startTime: body.startTime ?? current.startTime,
      endTime: body.endTime ?? current.endTime,
    };

    return HttpResponse.json(bookings[index]);
  }),

  msw.delete("/api/bookings/:id", ({ params }) => {
    const { id } = params as { id: string };
    bookings = bookings.filter((b) => b.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];