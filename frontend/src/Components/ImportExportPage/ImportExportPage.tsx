import { useState, useRef } from "react";
import {
  Box, Button, Typography, Stack, Paper, Alert, Divider,
} from "@mui/material";
import { Download, Upload } from "@mui/icons-material";
import { roomsPayload, assetsPayload, bookingsPayload } from "@/mocks/data";
import type { AppData } from "@/types/app";

const SCHEMA_VERSION = "1.0";

export function ImportExportPage() {
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buildSnapshot = (): AppData => ({
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    rooms: roomsPayload.items,
    assets: assetsPayload.items,
    bookings: bookingsPayload,
  });

  const handleExport = () => {
    const data = buildSnapshot();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `room-assets-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: "success", text: "Экспорт завершён. Файл скачан." });
  };

  const handleImport = async (file: File) => {
    setMessage(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as AppData;

      if (!data.rooms || !Array.isArray(data.rooms)) {
        throw new Error("Отсутствует поле rooms");
      }
      if (!data.assets || !Array.isArray(data.assets)) {
        throw new Error("Отсутствует поле assets");
      }
      if (!data.bookings || !Array.isArray(data.bookings)) {
        throw new Error("Отсутствует поле bookings");
      }

      // Проверка ссылочной целостности: у каждой брони есть ресурс
      const roomIds = new Set(data.rooms.map((r) => r.id));
      for (const b of data.bookings) {
        if (b.room && !roomIds.has(b.room.id)) {
          throw new Error(`Бронь "${b.title}" ссылается на несуществующую аудиторию ${b.room.id}`);
        }
        if (new Date(b.startTime) >= new Date(b.endTime)) {
          throw new Error(`Бронь "${b.title}": начало позже окончания`);
        }
      }

      // Проверка пересечений внутри импорта
      for (let i = 0; i < data.bookings.length; i++) {
        for (let j = i + 1; j < data.bookings.length; j++) {
          const a = data.bookings[i];
          const b = data.bookings[j];
          if (a.room?.id === b.room?.id) {
            const overlap =
              new Date(a.startTime) < new Date(b.endTime) &&
              new Date(a.endTime) > new Date(b.startTime);
            if (overlap) {
              throw new Error(`Конфликт броней "${a.title}" и "${b.title}"`);
            }
          }
        }
      }

      setMessage({
        type: "success",
        text: `Файл валиден. Аудиторий: ${data.rooms.length}, Ассетов: ${data.assets.length}, Броней: ${data.bookings.length}.`,
      });
    } catch (e) {
      setMessage({ type: "error", text: `Ошибка импорта: ${(e as Error).message}` });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
    e.target.value = "";
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>Импорт / Экспорт данных</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Сохраните снимок каталога и броней в JSON-файл или загрузите данные из файла.
      </Typography>

      <Stack spacing={3}>
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #eef0f3", borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Download color="primary" />
            <Typography variant="h6">Экспорт</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Скачать полный снимок каталога (аудитории + инвентарь) и всех броней в формате JSON.
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 2 }}>
            Схема: v{SCHEMA_VERSION} · Формат времени: RFC 3339 / UTC
          </Typography>
          <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
            Скачать JSON
          </Button>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: "1px solid #eef0f3", borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Upload color="primary" />
            <Typography variant="h6">Импорт</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Загрузите JSON-файл. Система проверит схему, ссылочную целостность и отсутствие пересечений.
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button variant="outlined" startIcon={<Upload />} onClick={() => fileInputRef.current?.click()}>
            Выбрать файл
          </Button>
        </Paper>

        {message && (
          <Alert severity={message.type}>{message.text}</Alert>
        )}

        <Divider />
        <Typography variant="caption" color="text.secondary">
          Данные хранятся локально в браузере. Для переноса между устройствами используйте экспорт/импорт.
        </Typography>
      </Stack>
    </Box>
  );
}