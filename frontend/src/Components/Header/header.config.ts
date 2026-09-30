import type { NavItem } from "./header.types";
import { ListAltOutlined, EventNoteOutlined, ImportExportOutlined } from "@mui/icons-material";

export const DEFAULT_NAV: NavItem[] = [
  { id: "catalog", label: "Каталог", icon: ListAltOutlined },
  { id: "bookings", label: "Управление бронированием", icon: EventNoteOutlined },
  { id: "import-export", label: "Импорт/Экспорт", icon: ImportExportOutlined },
];