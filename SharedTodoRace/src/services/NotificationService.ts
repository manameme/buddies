import io, { Socket } from 'socket.io-client';
import { Alert } from 'react-native';

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
    if (socket?.connected) return socket;
  
    socket = io('http://192.168.1.11:3000', {
      transports: ['websocket'],
      query: { userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
  
    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      socket?.emit('joinUserRoom', userId); // Join user-specific room
    });
  
    // Add error handling
    socket.on('connect_error', (err) => {
      console.log('Connection error:', err);
    });
  
    return socket;
  };

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};