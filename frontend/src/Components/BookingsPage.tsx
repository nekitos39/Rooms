import { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography, Button } from "@mui/material";
import { BookingForm } from './BookingForm';
import { BookingsList } from './BookingsList';
import { fetchRooms, type RoomDto } from "@/api/roomsApi";
import type { BookingDto } from "@/api/bookingsApi"; 

export function BookingsPage({ onBookingCreated }: { onBookingCreated: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomDto[]>([]);

  const [editingBooking, setEditingBooking] = useState<BookingDto | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchRooms(1);
        if (mounted) setRooms(data.items);
      } catch (e) {
        if (mounted) setError((e as Error).message || "Ошибка загрузки");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);


  const handleEditBooking = (booking: BookingDto) => {
    setEditingBooking(booking); 
  };

  const handleBookingSaved = () => {
    onBookingCreated();
    setEditingBooking(null); 
  };


  if (loading) return <Box sx={{ p: 3, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Typography color="error">Не удалось загрузить аудитории: {error}</Typography></Box>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {editingBooking ? (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Редактирование брони: "{editingBooking.title}"</Typography>
            <Button variant="outlined" onClick={() => setEditingBooking(null)}>
              Отменить
            </Button>
          </Box>
        ) : (
          <Typography variant="h4" component="h1" gutterBottom>
            Создать новую бронь
          </Typography>
        )}

        <BookingForm
          rooms={rooms}
          onBookingCreated={onBookingCreated}
          editingBooking={editingBooking} 
          onBookingSaved={handleBookingSaved}
          onCancelEdit={() => setEditingBooking(null)}
        />

        <BookingsList
          onBookingDeleted={onBookingCreated}
          onBookingEdit={handleEditBooking} 
        />
      </Box>
    </Container>
  );
}