import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import type { RoomDto } from '@/api/roomsApi';
import { createBooking, updateBooking, type BookingDto } from '@/api/bookingsApi';

export function BookingForm({ rooms, onBookingSaved, editingBooking, onCancelEdit }: {
  rooms: RoomDto[];
  onBookingCreated: () => void;
  onBookingSaved: () => void;
  editingBooking: BookingDto | null;
  onCancelEdit: () => void;
}) {
  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingBooking) {

      setTitle(editingBooking.title);
      setRoomId(editingBooking.room.id);

      const localStartTime = new Date(editingBooking.startTime);
  
      const startTimeString = new Date(localStartTime.getTime() - localStartTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setStartTime(startTimeString);

      const localEndTime = new Date(editingBooking.endTime);
      const endTimeString = new Date(localEndTime.getTime() - localEndTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEndTime(endTimeString);
    } else {
      setTitle('');
      setRoomId('');
      setStartTime('');
      setEndTime('');
    }
  }, [editingBooking]); 

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roomId || !title || !startTime || !endTime) {
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    setIsLoading(true);

    try {
      
      const utcStartTime = new Date(startTime).toISOString();
      const utcEndTime = new Date(endTime).toISOString();

      if (editingBooking) {
        
        await updateBooking(editingBooking.id, {
          title,
          startTime: utcStartTime,
          endTime: utcEndTime,
        });
      } else {
        
        await createBooking({
          title,
          roomId,
          startTime: utcStartTime,
          endTime: utcEndTime,
        });
      }

      setSuccess(true);
      setTitle('');
      setRoomId('');
      setStartTime('');
      setEndTime('');
      onBookingSaved();

    } catch (error) {
      console.error('Ошибка при сохранении брони:', error);
      alert('Не удалось сохранить бронь. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'text.primary' }}>
        {editingBooking ? 'Редактировать бронь' : 'Создать новую бронь'}
      </Typography>

      <FormControl fullWidth margin="normal" required>
        <InputLabel id="room-select-label">Аудитория</InputLabel>
        <Select
          labelId="room-select-label"
          id="room-select"
          value={roomId}
          label="Аудитория"
          onChange={(e) => setRoomId(e.target.value)}
          disabled={isLoading || !!editingBooking} 
        >
          {rooms.map((room) => (
            <MenuItem key={room.id} value={room.id}>
              {room.name} ({room.code})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Название брони"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
        disabled={isLoading}
      />

      <TextField
        fullWidth
        label="Время начала"
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        margin="normal"
        required
        disabled={isLoading}
        InputLabelProps={{ shrink: true }}
        sx={{'& input[type="datetime-local"]::-webkit-calendar-picker-indicator': {filter: 'invert(1)'}}}
      />

      <TextField
        fullWidth
        label="Время окончания"
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        margin="normal"
        required
        disabled={isLoading}
        InputLabelProps={{ shrink: true }}
        sx={{'& input[type="datetime-local"]::-webkit-calendar-picker-indicator': {filter: 'invert(1)'}}}
      />

      <Box sx={{ mt: 3, mb: 2, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ flexGrow: 1 }} 
        >
          {isLoading ? 'Сохранение...' : (editingBooking ? 'Сохранить изменения' : 'Забронировать')}
        </Button>
        {editingBooking && (
          <Button
            variant="outlined"
            color="error" 
            disabled={isLoading}
            onClick={onCancelEdit}
            sx={{ flexGrow: 1 }} 
          >
            Отменить
          </Button>
        )}
      </Box>

      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Бронь успешно сохранена!
        </Alert>
      </Snackbar>
    </Box>
  );
}