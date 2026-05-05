// Protocolo v1.0 - Interfaces de Dados (Otimizadas)

/** Dados resumidos do jogador para tráfego de rede */
export interface PlayerData {
  n: string;   // Name
  x: number;   // Grid X
  y: number;   // Grid Y
  d: number;   // Direction (0:N, 1:S, 2:E, 3:W)
  c: number;   // Color (Mandatório v1.1)
}

/** Estado da sala */
export interface RoomState {
  p: { [id: string]: PlayerData }; // p = Players
}

// Payloads de Eventos (Client -> Server)

/** Login (l) */
export interface LoginPayload {
  n: string; // n = Name
}

/** Move (m) */
export interface MovePayload {
  x: number; // Target Grid X
  y: number; // Target Grid Y
  d: number; // Direction
}

/** Chat (c) */
export interface ChatPayload {
  m: string; // m = Message
}

// Payloads de Eventos (Server -> Client)

/** Join (j) */
export interface JoinPayload {
  id: string;
  n: string;
  x: number;
  y: number;
}

/** Moved (m) */
export interface MovedPayload {
  id: string;
  x: number;
  y: number;
  d: number;
}

/** Chat (c) */
export interface ServerChatPayload {
  id: string;
  m: string;
}
