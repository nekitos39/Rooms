import { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography, Tabs, Tab } from "@mui/material";
import { Header } from '@/Components/Header';
import { RoomsTable } from '@/Components/RoomsTable/RoomsTable';
import { AssetsTable } from '@/Components/AssetsTable/AssetsTable';
import { BookingsPage } from '@/Components/BookingsPage';
import { ImportExportPage } from '@/Components/ImportExportPage/ImportExportPage';
import { fetchRooms, type RoomDto } from "@/api/roomsApi";
import './App.css';

function App() {
  const [active, setActive] = useState("catalog");
  const [catalogTab, setCatalogTab] = useState(0);
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
    if (active === 'bookings') return <BookingsPage onBookingCreated={loadRooms} />;
    if (active === 'import-export') return <Container maxWidth="lg"><Box sx={{ my: 2 }}><ImportExportPage /></Box></Container>;

    if (active === 'catalog') {
      return (
        <Container maxWidth="lg">
          <Box sx={{ my: 2 }}>
            <Tabs value={catalogTab} onChange={(_, v) => setCatalogTab(v)} sx={{ mb: 2 }}>
              <Tab label="Аудитории" />
              <Tab label="Инвентарь" />
            </Tabs>

            {catalogTab === 0 && (
              <>
                {loading && <Box sx={{ p: 3, display: "grid", placeItems: "center" }}><CircularProgress /></Box>}
                {error && <Typography color="error">Не удалось загрузить данные: {error}</Typography>}
                {!loading && !error && <RoomsTable items={items} />}
              </>
            )}

            {catalogTab === 1 && <AssetsTable />}
          </Box>
        </Container>
      );
    }

    return <Box sx={{ p: 3 }}><Typography>Вкладка: {active}</Typography></Box>;
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