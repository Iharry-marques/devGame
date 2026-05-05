import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import { Player } from './Player';
import { PlayerData, RoomState, ChatMessage } from '../../../server/src/types';

const WORLD_W = 1200;
const WORLD_H = 700;
const GRID_SIZE = 60;

export class GameScene extends Phaser.Scene {
  private socket!: Socket;
  private localId!: string;
  private players: Map<string, Player> = new Map();

  constructor() {
    super({ key: 'GameScene' });
  }

  /** Lê socket e localId do registry injetado pelo main.ts via preBoot */
  create(): void {
    this.socket = this.registry.get('socket') as Socket;
    this.localId = this.registry.get('localId') as string;
    this.drawWorld();
    this.registerSocketEvents();
  }

  // ───── Desenha o mundo ─────────────────────────────────────────────────────

  private drawWorld(): void {
    // Fundo escuro
    this.add.rectangle(0, 0, WORLD_W, WORLD_H, 0x12122a).setOrigin(0);

    // Grid de linhas
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x2a2a4a, 0.8);

    for (let x = 0; x <= WORLD_W; x += GRID_SIZE) {
      grid.lineBetween(x, 0, x, WORLD_H);
    }
    for (let y = 0; y <= WORLD_H; y += GRID_SIZE) {
      grid.lineBetween(0, y, WORLD_W, y);
    }

    // Áreas decorativas
    const deco = this.add.graphics();

    // "Jardim" central
    deco.fillStyle(0x1a3a1a, 1);
    deco.fillRoundedRect(400, 250, 400, 200, 16);
    deco.lineStyle(2, 0x2ecc71, 0.4);
    deco.strokeRoundedRect(400, 250, 400, 200, 16);
    this.add.text(600, 350, '🌿 Jardim', {
      fontSize: '14px', color: '#4ade80', fontFamily: 'Inter, sans-serif',
    }).setOrigin(0.5).setAlpha(0.7);

    // "Palco" no topo
    deco.fillStyle(0x2a1a3a, 1);
    deco.fillRoundedRect(480, 20, 240, 80, 12);
    deco.lineStyle(2, 0x9b59b6, 0.5);
    deco.strokeRoundedRect(480, 20, 240, 80, 12);
    this.add.text(600, 60, '🎤 Palco', {
      fontSize: '14px', color: '#c084fc', fontFamily: 'Inter, sans-serif',
    }).setOrigin(0.5).setAlpha(0.8);

    // Instruções
    this.add.text(10, WORLD_H - 20, 'Clique para mover', {
      fontSize: '11px', color: '#475569', fontFamily: 'Inter, sans-serif',
    });
  }

  // ───── Eventos de Socket ───────────────────────────────────────────────────

  private registerSocketEvents(): void {
    // Estado inicial da sala
    this.socket.on('room:state', (state: RoomState) => {
      Object.values(state.players).forEach((data) => {
        this.spawnPlayer(data, data.id === this.localId);
      });
    });

    // Novo jogador entrou
    this.socket.on('player:joined', (data: PlayerData) => {
      if (!this.players.has(data.id)) {
        this.spawnPlayer(data, false);
      }
    });

    // Jogador se moveu
    this.socket.on('player:moved', (data: PlayerData) => {
      const player = this.players.get(data.id);
      player?.setTargetPosition(data.x, data.y);
    });

    // Mensagem de chat — mostrar balão no mundo
    this.socket.on('chat:message', (msg: ChatMessage) => {
      const player = this.players.get(msg.playerId);
      player?.showBubble(msg.text);
    });

    // Jogador saiu
    this.socket.on('player:left', (id: string) => {
      const player = this.players.get(id);
      if (player) {
        player.destroy();
        this.players.delete(id);
      }
    });
  }

  // ───── Helpers ────────────────────────────────────────────────────────────

  private spawnPlayer(data: PlayerData, isLocal: boolean): void {
    const player = new Player(
      this,
      data,
      isLocal,
      isLocal ? this.socket : undefined
    );
    this.players.set(data.id, player);
  }

  // ───── Loop do jogo ───────────────────────────────────────────────────────

  update(): void {
    this.players.forEach((player) => player.update());
  }
}
