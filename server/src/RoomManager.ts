import { PlayerData, RoomState, ChatMessage } from './types';

// Paleta de cores para os avatares dos jogadores
const PLAYER_COLORS = [
  0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12,
  0x9b59b6, 0x1abc9c, 0xe67e22, 0x34495e,
];

/**
 * RoomManager é responsável por manter o estado dos jogadores
 * em memória. Não há persistência — tudo se perde ao reiniciar.
 */
export class RoomManager {
  private players: { [id: string]: PlayerData } = {};
  private colorIndex = 0;

  /** Adiciona um novo jogador e retorna seus dados */
  addPlayer(id: string, name: string): PlayerData {
    const color = PLAYER_COLORS[this.colorIndex % PLAYER_COLORS.length];
    this.colorIndex++;

    const player: PlayerData = {
      id,
      name: name.trim().slice(0, 20) || 'Visitante',
      x: 100 + Math.floor(Math.random() * 600),
      y: 100 + Math.floor(Math.random() * 400),
      color,
    };

    this.players[id] = player;
    return player;
  }

  /** Remove um jogador */
  removePlayer(id: string): void {
    delete this.players[id];
  }

  /** Atualiza a posição de um jogador */
  movePlayer(id: string, x: number, y: number): PlayerData | null {
    const player = this.players[id];
    if (!player) return null;
    player.x = Math.max(0, Math.min(x, 1200));
    player.y = Math.max(0, Math.min(y, 700));
    return player;
  }

  /** Retorna o estado atual da sala */
  getState(): RoomState {
    return { players: { ...this.players } };
  }

  /** Verifica se um jogador existe */
  getPlayer(id: string): PlayerData | undefined {
    return this.players[id];
  }
}
