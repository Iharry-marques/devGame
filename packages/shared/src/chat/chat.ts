import { AvatarId } from "../player/avatar";

export type ChatMessage = {
  playerId: string;
  playerName: string;
  avatar: AvatarId;
  message: string;
  timestamp: number;
};

