// utils/socket.js
import { io } from "socket.io-client";
export const socket = io("https://codex-build-backend.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});
