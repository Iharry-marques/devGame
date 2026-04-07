import { MapSchema, Schema, type } from "@colyseus/schema";

import { PlayerState } from "./PlayerState";

export class LobbyRoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}

