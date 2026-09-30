import { http } from "./http";
import type { AssetDto, AssetsResponseDto } from "@/types/assets";

export async function fetchAssets(page = 1): Promise<AssetsResponseDto> {
  const { data } = await http.get<AssetsResponseDto>("/assets", {
    params: { page },
  });
  return data;
}