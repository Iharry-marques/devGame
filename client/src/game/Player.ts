import { Socket } from 'socket.io-client';
import { Avatar } from './Avatar';

const GRID_SIZE = 32;
const LERP_FACTOR = 0.15;
const BUBBLE_DURATION = 4000;

export class Player {
  private scene: Phaser.Scene;
  readonly id: string;
  readonly isLocal: boolean;
  private socket?: Socket;

  // Estado
  private gridX: number;
  private gridY: number;
  private direction: number = 1;

  // Visual
  private targetX: number;
  private targetY: number;
  private avatar: Avatar;
  private nameLabel: Phaser.GameObjects.Text;
  
  // Chat Bubble
  private bubbleEl: HTMLDivElement | null = null;
  private bubbleTimeout: any = null;

  // Input
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: { [key: string]: Phaser.Input.Keyboard.Key };
  private lastMoveTime = 0;
  private moveInterval = 180;

  constructor(
    scene: Phaser.Scene,
    id: string,
    data: any,
    isLocal: boolean,
    socket?: Socket
  ) {
    this.scene = scene;
    this.id = id;
    this.isLocal = isLocal;
    this.socket = socket;
    
    this.gridX = data.x;
    this.gridY = data.y;
    this.direction = data.d || 1;
    this.targetX = this.gridX * GRID_SIZE + GRID_SIZE / 2;
    this.targetY = this.gridY * GRID_SIZE + GRID_SIZE / 2;

    // Instanciar Classe Avatar
    this.avatar = new Avatar(scene, this.targetX, this.targetY, data.c || 0x3b82f6);
    this.avatar.setDirection(this.direction);

    // Label do Nome
    this.nameLabel = scene.add.text(this.targetX, this.targetY - 30, data.n || '...', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    if (isLocal) {
      this.cursors = scene.input.keyboard!.createCursorKeys();
      this.wasd = scene.input.keyboard!.addKeys('W,A,S,D') as any;
    }
  }

  setTargetPosition(gx: number, gy: number, d: number): void {
    this.gridX = gx;
    this.gridY = gy;
    this.direction = d;
    this.targetX = gx * GRID_SIZE + GRID_SIZE / 2;
    this.targetY = gy * GRID_SIZE + GRID_SIZE / 2;
    this.avatar.setDirection(d);
  }

  showBubble(text: string): void {
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
    if (this.bubbleEl) this.bubbleEl.remove();

    this.bubbleEl = document.createElement('div');
    this.bubbleEl.className = 'chat-bubble-float';
    this.bubbleEl.textContent = text;
    
    document.getElementById('game-container')?.appendChild(this.bubbleEl);
    this.updateBubblePosition();

    this.bubbleTimeout = setTimeout(() => {
      this.bubbleEl?.remove();
      this.bubbleEl = null;
    }, BUBBLE_DURATION);
  }

  private updateBubblePosition(): void {
    if (!this.bubbleEl) return;
    const cam = this.scene.cameras.main;
    const screenX = (this.avatar.x - cam.scrollX) * cam.zoom;
    const screenY = (this.avatar.y - cam.scrollY) * cam.zoom;
    this.bubbleEl.style.left = `${screenX}px`;
    this.bubbleEl.style.top = `${screenY - 50}px`;
  }

  update(): void {
    const nx = Phaser.Math.Linear(this.avatar.x, this.targetX, LERP_FACTOR);
    const ny = Phaser.Math.Linear(this.avatar.y, this.targetY, LERP_FACTOR);
    
    this.avatar.setPosition(nx, ny);
    this.nameLabel.setPosition(nx, ny - 30);
    this.updateBubblePosition();

    if (this.isLocal && this.socket) {
      const now = Date.now();
      if (now - this.lastMoveTime > this.moveInterval) {
        let dx = 0;
        let dy = 0;
        let dir = this.direction;

        if (this.cursors?.up.isDown || this.wasd?.W.isDown) { dy = -1; dir = 0; }
        else if (this.cursors?.down.isDown || this.wasd?.S.isDown) { dy = 1; dir = 1; }
        else if (this.cursors?.left.isDown || this.wasd?.A.isDown) { dx = -1; dir = 3; }
        else if (this.cursors?.right.isDown || this.wasd?.D.isDown) { dx = 1; dir = 2; }

        if (dx !== 0 || dy !== 0) {
          this.socket.emit('m', {
            x: this.gridX + dx,
            y: this.gridY + dy,
            d: dir
          });
          this.lastMoveTime = now;
        } else if (dir !== this.direction) {
          // Se apenas mudou de direção, também notificamos (opcional, mas bom para feedback)
          this.socket.emit('m', { x: this.gridX, y: this.gridY, d: dir });
          this.lastMoveTime = now;
        }
      }
    }
  }

  destroy(): void {
    this.avatar.destroy();
    this.nameLabel.destroy();
    if (this.bubbleEl) this.bubbleEl.remove();
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
  }
}
