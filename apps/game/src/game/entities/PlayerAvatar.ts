import { AvatarId, getAvatarDefinition } from "@social-universe/shared";
import Phaser from "phaser";

type PlayerAvatarOptions = {
  id: string;
  name: string;
  avatar: AvatarId;
  x: number;
  y: number;
};

export class PlayerAvatar {
  readonly id: string;
  private readonly container: Phaser.GameObjects.Container;
  private readonly label: Phaser.GameObjects.Text;
  private readonly body: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, options: PlayerAvatarOptions) {
    this.id = options.id;
    this.container = scene.add.container(options.x, options.y);

    this.body = scene.add.rectangle(0, 0, 28, 36, getAvatarDefinition(options.avatar).color, 1);
    this.body.setStrokeStyle(2, 0x122033, 1);

    this.label = scene.add.text(0, -34, options.name, {
      color: "#f7fbff",
      fontFamily: "Verdana, sans-serif",
      fontSize: "12px"
    });
    this.label.setOrigin(0.5, 0.5);

    this.container.add([this.body, this.label]);
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  getFollowTarget(): Phaser.GameObjects.Container {
    return this.container;
  }

  setProfile(name: string, avatar: AvatarId): void {
    this.label.setText(name);
    this.body.setFillStyle(getAvatarDefinition(avatar).color, 1);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
