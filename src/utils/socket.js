// src/utils/socket.js
import { io } from 'socket.io-client';

const socket = io("https://f5-online-learning-server.onrender.com", {
  transports: ['websocket'], // đảm bảo kết nối ổn định
});

socket.on('connect', () => {
  console.log('🟢 Socket connected:', socket.id);
});

export default socket;
