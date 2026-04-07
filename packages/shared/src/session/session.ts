import { CHAT_MESSAGE_MAX_LENGTH, PLAYER_NAME_MAX_LENGTH } from "../config/constants";
import { AvatarId, AVATAR_OPTIONS, isAvatarId } from "../player/avatar";
import { PlayerProfile } from "../player/player";

export function sanitizePlayerName(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, PLAYER_NAME_MAX_LENGTH);
}

export function sanitizeChatMessage(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, CHAT_MESSAGE_MAX_LENGTH);
}

export function toAvatarId(value: string | undefined): AvatarId {
  if (value && isAvatarId(value)) {
    return value;
  }

  return AVATAR_OPTIONS[0];
}

export function isValidPlayerProfile(profile: Partial<PlayerProfile>): profile is PlayerProfile {
  return typeof profile.name === "string" && profile.name.length > 0 && AVATAR_OPTIONS.includes(profile.avatar as AvatarId);
}

