import type { RoomDto } from "@/api/roomsApi";
import type { BookingDto } from "@/api/bookingsApi";
import type { AssetDto } from "@/types/assets";

export interface AppData {
  schemaVersion: string;
  exportedAt: string;
  rooms: RoomDto[];
  assets: AssetDto[];
  bookings: BookingDto[];
}