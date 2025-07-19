// src/utils/socket.js
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_BASE_URL, {
  transports: ['websocket'], // đảm bảo kết nối ổn định
});

export default socket;
