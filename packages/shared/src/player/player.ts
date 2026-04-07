import { AvatarId } from "./avatar";

export type PlayerProfile = {
  name: string;
  avatar: AvatarId;
};

export type PlayerSnapshot = PlayerProfile & {
  id: string;
  x: number;
  y: number;
};

