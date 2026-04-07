import { UpdatePositionMessage } from "@social-universe/shared";

import { applyMovement } from "../../domain/player";
import { LobbyRoomState } from "../schema/LobbyRoomState";

export function handleMovement(
  state: LobbyRoomState,
  sessionId: string,
  message: Partial<UpdatePositionMessage> | undefined
): void {
  const player = state.players.get(sessionId);

  if (!player) {
    return;
  }

  applyMovement(player, message?.inputX ?? 0, message?.inputY ?? 0);
}
