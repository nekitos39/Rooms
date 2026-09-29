import { http } from "./http";

const HARDCODED_USER_ID = "cmj1ke2ov0000mz6l9vl2kx50";

export interface CreateBookingDto {
  title: string;
  roomId: string;
  startTime: string;
  endTime: string;
}

export async function createBooking(bookingData: CreateBookingDto) {
  const { data } = await http.post('/bookings', {
    ...bookingData,
    userId: HARDCODED_USER_ID,
  });
  return data;
}


export interface UpdateBookingDto {
  title: string;
  startTime: string; 
  endTime: string;     
}

export async function updateBooking(id: string, bookingData: UpdateBookingDto) {
  const { data } = await http.patch(`/bookings/${id}`, bookingData);
  return data;
}


export interface UserDto {
  id: string;
  email: string;
}

export interface RoomSummaryDto {
  id: string;
  name: string;
  number: string;
}

export interface BookingDto {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  notes?: string;
  room: RoomSummaryDto;
  user: UserDto;
}

export async function fetchBookings(): Promise<BookingDto[]> {
  const { data } = await http.get<BookingDto[]>('/bookings');
  return data;
}

export async function deleteBooking(id: string): Promise<void> {
  await http.delete(`/bookings/${id}`);
}