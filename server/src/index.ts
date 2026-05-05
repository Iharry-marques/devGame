import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { RoomManager } from './RoomManager';
import { LoginPayload, MovePayload, ChatPayload } from './types';

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const lobby = new RoomManager();

io.on('connection', (socket: Socket) => {
  console.log(`[+] Socket: ${socket.id}`);

  // LOGIN (l)
  socket.on('l', (payload: LoginPayload) => {
    const player = lobby.addPlayer(socket.id, payload.n);
    
    // Todos entram no lobby
    socket.join('room_lobby');

    // Envia o estado atual da sala para quem entrou
    socket.emit('s', lobby.getState());

    // Notifica os outros no lobby
    socket.to('room_lobby').emit('j', {
      id: socket.id,
      n: player.n,
      x: player.x,
      y: player.y,
      c: player.c
    });

    console.log(`[JOIN] ${player.n} entrou no lobby`);
  });

  // MOVE (m)
  socket.on('m', (payload: MovePayload) => {
    const updated = lobby.movePlayer(socket.id, payload.x, payload.y, payload.d);
    
    if (updated) {
      // Broadcast do movimento validado para todos na sala
      io.to('room_lobby').emit('m', {
        id: socket.id,
        x: updated.x,
        y: updated.y,
        d: updated.d
      });
    } else {
      // Se inválido, poderíamos enviar um 'sync' para o cliente, 
      // mas por enquanto apenas ignoramos (o cliente deve se auto-corrigir no próximo state)
      const player = lobby.getPlayer(socket.id);
      if (player) {
         socket.emit('m', { id: socket.id, x: player.x, y: player.y, d: player.d });
      }
    }
  });

  // CHAT (c)
  socket.on('c', (payload: ChatPayload) => {
    const player = lobby.getPlayer(socket.id);
    if (!player || !payload.m) return;

    const message = payload.m.trim().slice(0, 100);
    
    // Envia a mensagem para todos na sala
    io.to('room_lobby').emit('c', {
      id: socket.id,
      m: message
    });
    
    console.log(`[CHAT] ${player.n}: ${message}`);
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    const player = lobby.getPlayer(socket.id);
    if (player) {
      console.log(`[-] ${player.n} saiu`);
      lobby.removePlayer(socket.id);
      io.to('room_lobby').emit('q', { id: socket.id });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Server v1.0 (Lobby) rodando em http://localhost:${PORT}`);
});
