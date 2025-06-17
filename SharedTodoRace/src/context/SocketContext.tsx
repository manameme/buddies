// src/context/SocketContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
  socket: Socket | null;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ 
  children, 
  socket 
}) => (
  <SocketContext.Provider value={{ socket }}>
    {children}
  </SocketContext.Provider>
);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};