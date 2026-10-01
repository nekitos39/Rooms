import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error("HTTP error:", err);
    throw err;
  }
);