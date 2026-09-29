import { http } from "./http";

export type RoomStatus = "available" | "booked" | "maintenance";

export interface RoomDto {
  id: string;
  code: string;
  name: string;
  capacity: number;
  equipment: string[];
  status: RoomStatus;
}

export interface RoomsResponseDto {
  items: RoomDto[];
  page: number;
  total: number;
}

const mapRoomToDto = (room: any): RoomDto => ({
  id: room.id,
  code: room.number,        
  name: room.name,
  capacity: room.capacity,
  equipment: room.features, 
  status: room.status,      
});

export async function fetchRooms(page = 1): Promise<RoomsResponseDto> {

  const { data } = await http.get<any[]>("/rooms"); 

  const items = data.map(mapRoomToDto);

  return {
    items,
    page,
    total: items.length, 
  };
}