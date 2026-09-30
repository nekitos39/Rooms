import { useEffect, useState } from "react";
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Typography, Box, CircularProgress, Stack, TextField,
} from "@mui/material";
import { fetchAssets } from "@/api/assetsApi";
import type { AssetDto, AssetStatus } from "@/types/assets";

const STATUS_LABEL: Record<AssetStatus, string> = {
  available: "Доступен",
  in_use: "Используется",
  maintenance: "На обслуживании",
  retired: "Списан",
};

const STATUS_COLOR: Record<AssetStatus, "success" | "warning" | "default" | "error"> = {
  available: "success",
  in_use: "warning",
  maintenance: "default",
  retired: "error",
};

export function AssetsTable() {
  const [items, setItems] = useState<AssetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAssets();
        setItems(data.items);
      } catch (e) {
        setError((e as Error).message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Box sx={{ p: 3, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Typography color="error">Ошибка: {error}</Typography></Box>;

  const filtered = items.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.inventoryCode.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Поиск по названию или коду"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #eef0f3" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={140}>Инв. номер</TableCell>
              <TableCell>Название</TableCell>
              <TableCell width={180}>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id} hover>
                <TableCell sx={{ color: "text.secondary" }}>{a.inventoryCode}</TableCell>
                <TableCell><Typography fontWeight={600}>{a.name}</Typography></TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABEL[a.status]}
                    size="small"
                    color={STATUS_COLOR[a.status]}
                    variant={a.status === "maintenance" ? "outlined" : "filled"}
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