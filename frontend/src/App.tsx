import { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography } from "@mui/material";
import { Header } from './Components/Header';
import { RoomsTable } from '@/Components/RoomsTable/RoomsTable';
import { BookingsPage } from '@/Components/BookingsPage'; 
import { fetchRooms, type RoomDto } from "@/api/roomsApi";
import './App.css'

function App() {
  const [active, setActive] = useState("catalog");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<RoomDto[]>([]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await fetchRooms(1);
      setItems(data.items);
      setError(null); 
    } catch (e) {
      setError((e as Error).message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const renderContent = () => {
    if (loading) return <Box sx={{ p: 3, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
    if (error) return <Box sx={{ p: 3 }}><Typography color="error">Не удалось загрузить данные: {error}</Typography></Box>;

    switch (active) {
      case 'bookings':
        return <BookingsPage onBookingCreated={loadRooms} />;
      case 'catalog':
      default:
        return (
          <Container maxWidth="lg">
            <Box sx={{ my: 2 }}>
              <RoomsTable items={items} />
            </Box>
          </Container>
        );
    }
  };

  return (
    <>
      <Header
        activeNavId={active}
        onNavigate={setActive}
        onBellClick={() => console.log("bell")}
      />
      {renderContent()}
    </>
  );
}

export default App;