// src/utils/socket.js
import { io } from 'socket.io-client';

const socket = io("http://localhost:3001", {
  transports: ['websocket'], // đảm bảo kết nối ổn định
});

socket.on('connect', () => {
  console.log('🟢 Socket connected:', socket.id);
});

export default socket;
