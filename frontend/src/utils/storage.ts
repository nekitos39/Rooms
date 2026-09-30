import type { AppData } from "@/types/app";

const STORAGE_KEY = "room-assets:data";

export function loadAppData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppData) : null;
  } catch {
    return null;
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearAppData(): void {
  localStorage.removeItem(STORAGE_KEY);
}