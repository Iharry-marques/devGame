import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { RoomManager } from './RoomManager';
import { JoinPayload, MovePayload, ChatPayload } from './types';

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const room = new RoomManager();

// Rota de health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', players: Object.keys(room.getState().players).length });
});

io.on('connection', (socket: Socket) => {
  console.log(`[+] Socket conectado: ${socket.id}`);

  // ─── player:join ──────────────────────────────────────────────────────────
  socket.on('player:join', (payload: JoinPayload) => {
    const player = room.addPlayer(socket.id, payload.name);

    // Envia o estado completo apenas para o novo jogador
    socket.emit('room:state', room.getState());

    // Notifica os outros que um novo jogador entrou
    socket.broadcast.emit('player:joined', player);

    console.log(`[JOIN] ${player.name} (${socket.id})`);
  });

  // ─── player:move ──────────────────────────────────────────────────────────
  socket.on('player:move', (payload: MovePayload) => {
    const updated = room.movePlayer(socket.id, payload.x, payload.y);
    if (!updated) return;

    // Broadcast para TODOS (inclusive o emitente, para confirmar)
    io.emit('player:moved', updated);
  });

  // ─── chat:message ─────────────────────────────────────────────────────────
  socket.on('chat:message', (payload: ChatPayload) => {
    const player = room.getPlayer(socket.id);
    if (!player) return;

    const text = payload.text?.trim().slice(0, 100);
    if (!text) return;

    const message = {
      playerId: socket.id,
      playerName: player.name,
      text,
      timestamp: Date.now(),
    };

    // Repassa a mensagem para todos
    io.emit('chat:message', message);
    console.log(`[CHAT] ${player.name}: ${text}`);
  });

  // ─── disconnect ───────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const player = room.getPlayer(socket.id);
    if (player) {
      console.log(`[-] ${player.name} (${socket.id}) desconectou`);
    }
    room.removePlayer(socket.id);
    socket.broadcast.emit('player:left', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
