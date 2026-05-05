import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';

/** Singleton de conexão Socket.io */
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Conectado:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket] Desconectado:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Erro de conexão:', err.message);
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}
