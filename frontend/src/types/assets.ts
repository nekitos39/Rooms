export type AssetStatus = "available" | "in_use" | "maintenance" | "retired";

export interface AssetDto {
  id: string;
  name: string;
  inventoryCode: string;
  status: AssetStatus;
}

export interface AssetsResponseDto {
  items: AssetDto[];
  page: number;
  total: number;
}