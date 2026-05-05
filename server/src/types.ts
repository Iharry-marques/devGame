// Interfaces compartilhadas entre client e server
export interface PlayerData {
  id: string;
  name: string;
  x: number;
  y: number;
  color: number; // Stored as hex number e.g. 0xff5733
}

export interface RoomState {
  players: { [id: string]: PlayerData };
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

// Payloads de eventos Socket.io
export interface JoinPayload {
  name: string;
}

export interface MovePayload {
  x: number;
  y: number;
}

export interface ChatPayload {
  text: string;
}
