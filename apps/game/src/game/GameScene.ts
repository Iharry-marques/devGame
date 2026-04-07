import { WORLD_HEIGHT, WORLD_WIDTH } from "@social-universe/shared";
import Phaser from "phaser";

import { NetworkManager } from "../network/NetworkManager";
import { PlayerAvatar } from "./entities/PlayerAvatar";

export class GameScene extends Phaser.Scene {
  private readonly network: NetworkManager;
  private readonly players = new Map<string, PlayerAvatar>();
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  private movementElapsed = 0;

  constructor(network: NetworkManager) {
    super("game-scene");
    this.network = network;
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#142236");
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.drawRoomEnvironment();

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard
      ? {
          up: this.input.keyboard.addKey("W"),
          down: this.input.keyboard.addKey("S"),
          left: this.input.keyboard.addKey("A"),
          right: this.input.keyboard.addKey("D")
        }
      : undefined;

    this.network.on("players", (players) => {
      const activeIds = new Set(players.map((player) => player.id));

      players.forEach((player) => {
        const existing = this.players.get(player.id);

        if (existing) {
          existing.setProfile(player.name, player.avatar);
          existing.setPosition(player.x, player.y);
        } else {
          const avatar = new PlayerAvatar(this, player);
          this.players.set(player.id, avatar);

          if (player.id === this.network.getSessionId()) {
            this.cameras.main.startFollow(avatar.getFollowTarget(), true, 0.12, 0.12);
          }
        }
      });

      this.players.forEach((avatar, id) => {
        if (!activeIds.has(id)) {
          avatar.destroy();
          this.players.delete(id);
        }
      });
    });
  }

  preload(): void {
    // Load the tilemap as both an image (for Tilemap) and a spritesheet (for standalone prop sprites)
    this.load.image('urban_image', '/assets/kenney_urban/Tilemap/tilemap_packed.png');
    this.load.spritesheet('urban', '/assets/kenney_urban/Tilemap/tilemap_packed.png', { frameWidth: 16, frameHeight: 16 });
  }

  private drawRoomEnvironment(): void {
    const tileSize = 16;
    const scaleFactor = 3; 

    // Define background color
    this.cameras.main.setBackgroundColor("#aebdc9");
    const widthInTiles = Math.ceil(WORLD_WIDTH / (tileSize * scaleFactor));
    const heightInTiles = Math.ceil(WORLD_HEIGHT / (tileSize * scaleFactor));

    // Create structured floor (Ground / Road intersection)
    const levelMap = [];
    const roadCenterY = Math.floor(heightInTiles / 2);
    const roadCenterX = Math.floor(widthInTiles / 2);

    for (let y = 0; y < heightInTiles; y++) {
      const row = [];
      for (let x = 0; x < widthInTiles; x++) {
        // Cross intersection logic
        const isHorzRoad = Math.abs(y - roadCenterY) <= 2;
        const isVertRoad = Math.abs(x - roadCenterX) <= 2;
        
        if (isHorzRoad || isVertRoad) {
          row.push(27); // Attempt road / pavement tile index
        } else {
          row.push(1); // Grass/Base tile index
        }
      }
      levelMap.push(row);
    }

    const map = this.make.tilemap({ data: levelMap, tileWidth: tileSize, tileHeight: tileSize });
    const tileset = map.addTilesetImage('urban_tileset', 'urban_image', tileSize, tileSize, 0, 0);
    if (tileset) {
       const layer = map.createLayer(0, tileset, 0, 0);
       if (layer) {
           layer.setScale(scaleFactor);
       }
    }

    // Create a large, structured central building (Grande Prédio)
    // We explicitly place columns and rows of building tiles
    const cx = roadCenterX * tileSize * scaleFactor;
    const cy = (roadCenterY - 6) * tileSize * scaleFactor; // Above the horizontal road

    // Constructing a 5x4 building structure using sprites
    for(let by = -4; by <= 0; by++) {
      for(let bx = -4; bx <= 4; bx++) {
         let frame = 136; // Generic building wall/window
         if (by === -4) frame = 109; // Try roof frame
         if (by === 0 && bx === 0) frame = 163; // Try door frame
         
         const b = this.add.sprite(cx + bx * tileSize * scaleFactor, cy + by * tileSize * scaleFactor, 'urban', frame);
         b.setScale(scaleFactor);
         b.setDepth(10); // Buildings are on top of ground map
      }
    }

    // Create a neat row of smaller houses along the road sides
    for(let i = -4; i <= 4; i++) {
       if (Math.abs(i) < 2) continue; // Leave central intersection clear
       
       // Left/Right side horizontal road houses
       const hX = cx + i * 200;
       const hY = roadCenterY * tileSize * scaleFactor - 150;
       
       const house = this.add.sprite(hX, hY, 'urban', 244); 
       house.setScale(scaleFactor * 1.5);
       house.setDepth(10);
    }

    // UI overlays
    this.add.rectangle(WORLD_WIDTH / 2, 80, 560, 80, 0x1d3652, 0.95).setStrokeStyle(3, 0x7ed7b2, 0.8).setDepth(100);
    this.add.text(WORLD_WIDTH / 2, 65, "Lobby: A Cidade (Organizada)", {
      color: "#f5f7fa",
      fontFamily: "Verdana, sans-serif",
      fontSize: "28px",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100);
    
    this.add.text(WORLD_WIDTH / 2, 98, "Predio central estruturado e cruzamento configurado", {
      color: "#c5d1de",
      fontFamily: "Verdana, sans-serif",
      fontSize: "15px"
    }).setOrigin(0.5).setDepth(100);
  }

  update(_time: number, delta: number): void {
    this.movementElapsed += delta;

    if (this.movementElapsed < 50) {
      return;
    }

    this.movementElapsed = 0;

    const inputX = this.getInputAxis("left", "right");
    const inputY = this.getInputAxis("up", "down");

    if (inputX === 0 && inputY === 0) {
      return;
    }

    this.network.sendMovement({
      inputX,
      inputY
    });
  }

  private getInputAxis(negative: "left" | "up", positive: "right" | "down"): -1 | 0 | 1 {
    const negativePressed =
      (this.cursors?.[negative]?.isDown ?? false) ||
      (this.wasd?.[negative]?.isDown ?? false);
    const positivePressed =
      (this.cursors?.[positive]?.isDown ?? false) ||
      (this.wasd?.[positive]?.isDown ?? false);

    if (negativePressed && !positivePressed) {
      return -1;
    }

    if (positivePressed && !negativePressed) {
      return 1;
    }

    return 0;
  }
}
