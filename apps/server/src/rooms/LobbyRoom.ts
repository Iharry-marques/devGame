import {
  ChatSendMessage,
  ClientMessageEvent,
  JoinOptions,
  ROOM_NAME,
  ServerMessageEvent,
  isValidPlayerProfile,
  sanitizePlayerName,
  toAvatarId
} from "@social-universe/shared";
import { Client, Room } from "colyseus";

import { createPlayerState } from "../domain/player";
import { createChatMessage } from "./handlers/chat";
import { handleMovement } from "./handlers/movement";
import { LobbyRoomState } from "./schema/LobbyRoomState";

export class LobbyRoom extends Room<LobbyRoomState> {
  onCreate(): void {
    this.setState(new LobbyRoomState());

    this.onMessage(ClientMessageEvent.UpdatePosition, (client, message) => {
      handleMovement(this.state, client.sessionId, message);
    });

    this.onMessage(ClientMessageEvent.ChatSend, (client, message: ChatSendMessage) => {
      const chat = createChatMessage(this.state, client.sessionId, message?.message);

      if (!chat) {
        return;
      }

      this.broadcast(ServerMessageEvent.ChatMessage, chat);
    });
  }

  async onJoin(client: Client, options: Partial<JoinOptions>): Promise<void> {
    const profile = {
      name: sanitizePlayerName(options.name ?? ""),
      avatar: toAvatarId(options.avatar)
    };

    if (!isValidPlayerProfile(profile)) {
      throw new Error("Invalid player profile");
    }

    this.state.players.set(client.sessionId, createPlayerState(client.sessionId, profile));
  }

  onLeave(client: Client): void {
    this.state.players.delete(client.sessionId);
  }
}
