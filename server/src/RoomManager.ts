import { PlayerData, RoomState } from './types';

// Paleta de cores para os avatares (Habbo-style colors)
const AVATAR_COLORS = [
  0x3b82f6, // Blue
  0xef4444, // Red
  0x10b981, // Green
  0xf59e0b, // Amber
  0x8b5cf6, // Violet
  0xec4899, // Pink
  0x06b6d4, // Cyan
];

export class RoomManager {
  private players: Map<string, PlayerData> = new Map();
  
  private readonly GRID_SIZE = 32;
  private readonly WORLD_WIDTH = 40;
  private readonly WORLD_HEIGHT = 22;

  addPlayer(id: string, name: string): PlayerData {
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    
    const player: PlayerData = {
      n: name.trim().slice(0, 15) || 'Guest',
      x: 10 + Math.floor(Math.random() * 5),
      y: 10 + Math.floor(Math.random() * 5),
      d: 1, // South
      c: randomColor,
    };

    this.players.set(id, player);
    return player;
  }

  removePlayer(id: string): void {
    this.players.delete(id);
  }

  movePlayer(id: string, x: number, y: number, d: number): PlayerData | null {
    const player = this.players.get(id);
    if (!player) return null;

    const dx = Math.abs(x - player.x);
    const dy = Math.abs(y - player.y);
    const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    const isInsideWorld = x >= 0 && x < this.WORLD_WIDTH && y >= 0 && y < this.WORLD_HEIGHT;

    if (isAdjacent && isInsideWorld) {
      player.x = x;
      player.y = y;
      player.d = d;
      return player;
    }

    return null;
  }

  getState(): RoomState {
    const p: { [id: string]: PlayerData } = {};
    this.players.forEach((val, key) => { p[key] = val; });
    return { p };
  }

  getPlayer(id: string): PlayerData | undefined {
    return this.players.get(id);
  }
}
