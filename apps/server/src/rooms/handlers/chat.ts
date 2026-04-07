import { ChatMessage, sanitizeChatMessage } from "@social-universe/shared";

import { LobbyRoomState } from "../schema/LobbyRoomState";

export function createChatMessage(
  state: LobbyRoomState,
  sessionId: string,
  rawMessage: unknown
): ChatMessage | null {
  const player = state.players.get(sessionId);

  if (!player) {
    return null;
  }

  const message = sanitizeChatMessage(typeof rawMessage === "string" ? rawMessage : "");

  if (!message) {
    return null;
  }

  return {
    playerId: player.id,
    playerName: player.name,
    avatar: player.avatar,
    message,
    timestamp: Date.now()
  };
}
