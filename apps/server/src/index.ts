import { ROOM_NAME } from "@social-universe/shared";
import { Server } from "colyseus";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";

import { SERVER_PORT } from "./config/env";
import { LobbyRoom } from "./rooms/LobbyRoom";

const app = express();

app.use(cors());
app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    room: ROOM_NAME
  });
});

const httpServer = createServer(app);
const gameServer = new Server({
  server: httpServer
});

gameServer.define(ROOM_NAME, LobbyRoom);

httpServer.listen(SERVER_PORT, () => {
  console.log(`Multiplayer server running on http://localhost:${SERVER_PORT}`);
});

