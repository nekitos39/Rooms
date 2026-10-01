import { useState } from "react";
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Stack, Typography, TextField,
} from "@mui/material";
import { Groups2Outlined } from "@mui/icons-material";
import type { RoomDto } from "@/api/roomsApi";

const STATUS_LABEL: Record<RoomDto["status"], string> = {
  available: "Доступна",
  booked: "Забронирована",
  maintenance: "На обслуживании",
};
const STATUS_COLOR: Record<RoomDto["status"], "success" | "warning" | "default"> = {
  available: "success",
  booked: "warning",
  maintenance: "default",
};
const EQUIP_LABEL: Record<string, string> = {
  projector: "Проектор", microphone: "Микрофон", wifi: "Wi-Fi",
  computers: "Компьютеры", board: "Доска",
};

export function RoomsTable({ items }: { items: RoomDto[] }) {
  const [query, setQuery] = useState("");
  const [minCapacity, setMinCapacity] = useState(0);

  const filtered = items.filter((r) => {
    const matchQuery =
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.code.toLowerCase().includes(query.toLowerCase());
    const matchCapacity = r.capacity >= minCapacity;
    return matchQuery && matchCapacity;
  });

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Поиск по названию или номеру"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
        <TextField
          size="small"
          type="number"
          label="Мин. вместимость"
          value={minCapacity}
          onChange={(e) => setMinCapacity(Number(e.target.value))}
          sx={{ width: 200 }}
          InputProps={{ inputProps: { min: 0 } }}
        />
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #eef0f3" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={100}>Номер</TableCell>
              <TableCell>Название</TableCell>
              <TableCell width={160} align="right">Вместимость</TableCell>
              <TableCell>Оборудование</TableCell>
              <TableCell width={170}>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ color: "text.secondary" }}>{r.code}</TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography fontWeight={600}>{r.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                    <Groups2Outlined fontSize="small" />
                    <span>{r.capacity}</span>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {r.equipment.map((k) => (
                      <Chip key={k} label={EQUIP_LABEL[k] ?? k} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABEL[r.status]}
                    size="small"
                    color={STATUS_COLOR[r.status]}
                    variant={r.status === "maintenance" ? "outlined" : "filled"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}