import { Schema, type } from "@colyseus/schema";
import { AvatarId } from "@social-universe/shared";

export class PlayerState extends Schema {
  @type("string") id = "";
  @type("string") name = "";
  @type("string") avatar: AvatarId = "coral";
  @type("number") x = 0;
  @type("number") y = 0;
}

