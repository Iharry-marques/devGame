import {
  ChatMessage,
  ChatSendMessage,
  ClientMessageEvent,
  JoinOptions,
  PlayerSnapshot,
  ROOM_NAME,
  ServerMessageEvent,
  UpdatePositionMessage
} from "@social-universe/shared";
import { Client, Room } from "colyseus.js";

import { GAME_SERVER_URL } from "../config/env";

type RoomPlayerState = {
  id: string;
  name: string;
  avatar: PlayerSnapshot["avatar"];
  x: number;
  y: number;
};

type RoomStateShape = {
  players?: {
    forEach?: (callback: (player: RoomPlayerState) => void) => void;
  };
};

type NetworkEvents = {
  chat: ChatMessage;
  players: PlayerSnapshot[];
  connected: { sessionId: string };
};

type EventKey = keyof NetworkEvents;

type Listener<T extends EventKey> = (payload: NetworkEvents[T]) => void;

export class NetworkManager {
  private readonly client = new Client(GAME_SERVER_URL);
  private readonly listeners = new Map<EventKey, Set<Listener<EventKey>>>();
  private room: Room<RoomStateShape> | null = null;

  async connect(profile: JoinOptions): Promise<void> {
    this.room = await this.client.joinOrCreate(ROOM_NAME, profile);
    this.emit("connected", { sessionId: this.room.sessionId });

    this.room.onMessage(ServerMessageEvent.ChatMessage, (message: ChatMessage) => {
      this.emit("chat", message);
    });

    this.room.onStateChange(() => {
      this.emitPlayers();
    });

    if (this.room.state?.players?.forEach) {
      this.emitPlayers();
    }
  }

  on<T extends EventKey>(event: T, listener: Listener<T>): () => void {
    const current = (this.listeners.get(event) as Set<Listener<T>> | undefined) ?? new Set<Listener<T>>();
    current.add(listener);
    this.listeners.set(event, current as Set<Listener<EventKey>>);

    return () => {
      current.delete(listener);
    };
  }

  sendMovement(payload: UpdatePositionMessage): void {
    this.room?.send(ClientMessageEvent.UpdatePosition, payload);
  }

  sendChat(message: string): void {
    const payload: ChatSendMessage = { message };
    this.room?.send(ClientMessageEvent.ChatSend, payload);
  }

  getSessionId(): string | null {
    return this.room?.sessionId ?? null;
  }

  private emitPlayers(): void {
    const players = this.room?.state?.players;

    if (!players?.forEach) {
      return;
    }

    const snapshots: PlayerSnapshot[] = [];

    players.forEach((player) => {
      snapshots.push({
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        x: player.x,
        y: player.y
      });
    });

    this.emit("players", snapshots);
  }

  private emit<T extends EventKey>(event: T, payload: NetworkEvents[T]): void {
    const listeners = (this.listeners.get(event) as Set<Listener<T>> | undefined) ?? new Set<Listener<T>>();

    listeners.forEach((listener) => listener(payload));
  }
}
