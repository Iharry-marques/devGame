import {
  PLAYER_MOVE_DISTANCE,
  PlayerProfile,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  sanitizePlayerName,
  toAvatarId
} from "@social-universe/shared";

import { PlayerState } from "../rooms/schema/PlayerState";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function createSpawnPosition(): { x: number; y: number } {
  const margin = 100;

  return {
    x: Math.floor(Math.random() * (WORLD_WIDTH - margin * 2)) + margin,
    y: Math.floor(Math.random() * (WORLD_HEIGHT - margin * 2)) + margin
  };
}

export function createPlayerState(id: string, profile: PlayerProfile): PlayerState {
  const spawn = createSpawnPosition();
  const player = new PlayerState();

  player.id = id;
  player.name = sanitizePlayerName(profile.name);
  player.avatar = toAvatarId(profile.avatar);
  player.x = spawn.x;
  player.y = spawn.y;

  return player;
}

export function applyMovement(player: PlayerState, inputX: number, inputY: number): void {
  const safeInputX = Number.isFinite(inputX) ? inputX : 0;
  const safeInputY = Number.isFinite(inputY) ? inputY : 0;
  const directionX = clamp(Math.round(safeInputX), -1, 1);
  const directionY = clamp(Math.round(safeInputY), -1, 1);

  player.x = clamp(player.x + directionX * PLAYER_MOVE_DISTANCE, 0, WORLD_WIDTH);
  player.y = clamp(player.y + directionY * PLAYER_MOVE_DISTANCE, 0, WORLD_HEIGHT);
}
