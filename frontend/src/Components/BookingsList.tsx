import { useState, useEffect } from "react";
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Box, IconButton, Typography
} from "@mui/material";
import { DeleteOutline, Edit } from "@mui/icons-material";
import { fetchBookings, deleteBooking, type BookingDto } from "@/api/bookingsApi";

export function BookingsList({ onBookingDeleted, onBookingEdit }: { onBookingDeleted: () => void, onBookingEdit: (booking: BookingDto) => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingDto[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchBookings();
      setBookings(data);
      setError(null);
    } catch (e) {
      setError((e as Error).message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить бронь "${title}"?`)) {
      return;
    }

    try {
      await deleteBooking(id);
      onBookingDeleted();
    } catch (e) {
      alert('Не удалось удалить бронь.');
      console.error(e);
    }
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <Box sx={{ p: 3, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Typography color="error">Не удалось загрузить данные: {error}</Typography></Box>;

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #eef0f3" }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Список бронирований</Typography>
        
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Название</TableCell>
            <TableCell>Аудитория</TableCell>
            <TableCell>Время начала</TableCell>
            <TableCell>Время окончания</TableCell>
            <TableCell align="center">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} hover>
              <TableCell>{booking.title}</TableCell>
              <TableCell>{booking.room.name} ({booking.room.number})</TableCell>
              <TableCell>{formatDateTime(booking.startTime)}</TableCell>
              <TableCell>{formatDateTime(booking.endTime)}</TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  title="Редактировать"
                  onClick={() => onBookingEdit(booking)}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  title="Удалить"
                  onClick={() => handleDelete(booking.id, booking.title)}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}