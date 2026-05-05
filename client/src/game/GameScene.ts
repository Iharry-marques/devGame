import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import { Player } from './Player';
import { RoomState } from '../../../server/src/types';

const GRID_SIZE = 32;
const WORLD_W = 40 * GRID_SIZE; // 1280
const WORLD_H = 22 * GRID_SIZE; // 704

export class GameScene extends Phaser.Scene {
  private socket!: Socket;
  private localId!: string;
  private players: Map<string, Player> = new Map();

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.socket = this.registry.get('socket') as Socket;
    this.localId = this.registry.get('localId') as string;
    
    this.drawWorld();
    this.registerSocketEvents();
  }

  private drawWorld(): void {
    // Chão escuro (estilo Habbo / Cyberpunk)
    this.add.rectangle(0, 0, WORLD_W, WORLD_H, 0x0f172a).setOrigin(0);

    // Desenho do Grid usando Graphics repetido para melhor performance e visual
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1e293b, 1);

    // Linhas verticais
    for (let x = 0; x <= WORLD_W; x += GRID_SIZE) {
      grid.lineBetween(x, 0, x, WORLD_H);
    }
    // Linhas horizontais
    for (let y = 0; y <= WORLD_H; y += GRID_SIZE) {
      grid.lineBetween(0, y, WORLD_W, y);
    }

    // Adiciona uma borda sutil ao redor do mundo
    grid.lineStyle(2, 0x334155, 1);
    grid.strokeRect(0, 0, WORLD_W, WORLD_H);

    this.add.text(10, WORLD_H - 20, 'Walking Skeleton v1.1 - Use WASD', {
      fontSize: '11px', color: '#64748b', fontFamily: 'Inter, sans-serif',
    });
  }

  private registerSocketEvents(): void {
    // s = Room State (v1.1 com c=color)
    this.socket.on('s', (state: RoomState) => {
      Object.entries(state.p).forEach(([id, data]) => {
        if (!this.players.has(id)) {
          this.spawnPlayer(id, data, id === this.localId);
        }
      });
    });

    // j = Player Joined (v1.1 com c=color)
    this.socket.on('j', (data: { id: string, n: string, x: number, y: number, c: number }) => {
      if (!this.players.has(data.id)) {
        this.spawnPlayer(data.id, { 
          n: data.n, 
          x: data.x, 
          y: data.y, 
          d: 1, 
          c: data.c 
        }, false);
      }
    });

    this.socket.on('m', (data: { id: string, x: number, y: number, d: number }) => {
      const player = this.players.get(data.id);
      player?.setTargetPosition(data.x, data.y, data.d);
    });

    this.socket.on('c', (msg: { id: string, m: string }) => {
      const player = this.players.get(msg.id);
      player?.showBubble(msg.m);
    });

    this.socket.on('q', (data: { id: string }) => {
      const player = this.players.get(data.id);
      if (player) {
        player.destroy();
        this.players.delete(data.id);
      }
    });
  }

  private spawnPlayer(id: string, data: any, isLocal: boolean): void {
    const player = new Player(
      this,
      id,
      data,
      isLocal,
      isLocal ? this.socket : undefined
    );
    this.players.set(id, player);
  }

  update(): void {
    this.players.forEach((player) => player.update());
  }
}
