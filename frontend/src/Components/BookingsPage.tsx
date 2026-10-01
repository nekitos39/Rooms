import { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography } from "@mui/material";
import { BookingForm } from './BookingForm';
import { BookingsList } from './BookingsList';
import { fetchRooms, type RoomDto } from "@/api/roomsApi";
import type { BookingDto } from "@/api/bookingsApi";

export function BookingsPage({ onBookingCreated }: { onBookingCreated: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [editingBooking, setEditingBooking] = useState<BookingDto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
    setRefreshKey((k) => k + 1);
  };

  const handleBookingDeleted = () => {
    onBookingCreated();
    setRefreshKey((k) => k + 1);
  };

  if (loading) return <Box sx={{ p: 3, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Typography color="error">Не удалось загрузить аудитории: {error}</Typography></Box>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <BookingForm
          rooms={rooms}
          onBookingCreated={onBookingCreated}
          editingBooking={editingBooking}
          onBookingSaved={handleBookingSaved}
          onCancelEdit={() => setEditingBooking(null)}
        />

        <BookingsList
          key={refreshKey}
          onBookingDeleted={handleBookingDeleted}
          onBookingEdit={handleEditBooking}
        />
      </Box>
    </Container>
  );
}