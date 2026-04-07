import { PlayerProfile } from "../player/player";

export type JoinOptions = PlayerProfile;

export type UpdatePositionMessage = {
  inputX: -1 | 0 | 1;
  inputY: -1 | 0 | 1;
};

export type ChatSendMessage = {
  message: string;
};

