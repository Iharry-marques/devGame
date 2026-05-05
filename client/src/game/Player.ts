import { Socket } from 'socket.io-client';
import { PlayerData } from '../../../server/src/types';

const BUBBLE_DURATION = 5000; // ms
const LERP_FACTOR = 0.1;      // Suavização de movimento (0 = sem movimento, 1 = instantâneo)

/**
 * Player representa um avatar no mundo do jogo.
 * Funciona tanto para o jogador local quanto para jogadores remotos.
 */
export class Player {
  private scene: Phaser.Scene;
  readonly id: string;
  readonly isLocal: boolean;

  // Posição alvo (recebida do servidor) — usada no lerp
  private targetX: number;
  private targetY: number;

  // Objetos visuais
  private body: Phaser.GameObjects.Arc;
  private nameLabel: Phaser.GameObjects.Text;
  private bubbleContainer: Phaser.GameObjects.Container | null = null;
  private bubbleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    scene: Phaser.Scene,
    data: PlayerData,
    isLocal: boolean,
    socket?: Socket
  ) {
    this.scene = scene;
    this.id = data.id;
    this.isLocal = isLocal;
    this.targetX = data.x;
    this.targetY = data.y;

    // ── Avatar: círculo colorido ───────────────────────────────
    this.body = scene.add.circle(data.x, data.y, 22, data.color);

    // Anel branco para destacar o jogador local
    if (isLocal) {
      scene.add.circle(data.x, data.y, 26)
        .setStrokeStyle(2, 0xffffff, 0.6)
        .setFillStyle(0, 0)
        .setName(`ring_${data.id}`);
    }

    // ── Nome acima do avatar ───────────────────────────────────
    this.nameLabel = scene.add.text(data.x, data.y - 34, data.name, {
      fontSize: '12px',
      color: '#e2e8f0',
      fontFamily: 'Inter, sans-serif',
      stroke: '#0f0f1a',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // ── Clique para mover (apenas jogador local) ───────────────
    if (isLocal && socket) {
      scene.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        this.targetX = ptr.worldX;
        this.targetY = ptr.worldY;
        socket.emit('player:move', { x: this.targetX, y: this.targetY });
      });
    }
  }

  /** Atualiza a posição alvo (chamado quando servidor envia player:moved) */
  setTargetPosition(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Exibe balão de fala acima do avatar.
   * Se já houver um balão, substitui.
   */
  showBubble(text: string): void {
    // Remove balão anterior
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    if (this.bubbleContainer) {
      this.bubbleContainer.destroy();
      this.bubbleContainer = null;
    }

    const padding = { x: 10, y: 6 };
    const maxWidth = 160;

    const bubbleText = this.scene.add.text(0, 0, text, {
      fontSize: '11px',
      color: '#1a1a2e',
      fontFamily: 'Inter, sans-serif',
      wordWrap: { width: maxWidth - padding.x * 2 },
      align: 'center',
    }).setOrigin(0.5);

    const bw = Math.min(bubbleText.width + padding.x * 2, maxWidth);
    const bh = bubbleText.height + padding.y * 2;

    // Fundo do balão
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 8);

    // Setinha apontando para baixo
    const tip = this.scene.add.graphics();
    tip.fillStyle(0xffffff, 0.95);
    tip.fillTriangle(-6, bh / 2, 6, bh / 2, 0, bh / 2 + 8);

    this.bubbleContainer = this.scene.add.container(
      this.body.x,
      this.body.y - 60,
      [bg, tip, bubbleText]
    );

    // Auto-destruição após BUBBLE_DURATION
    this.bubbleTimer = setTimeout(() => {
      this.bubbleContainer?.destroy();
      this.bubbleContainer = null;
    }, BUBBLE_DURATION);
  }

  /** Chamado a cada frame pelo Phaser — faz a interpolação linear */
  update(): void {
    // Lerp suave para a posição alvo
    const newX = Phaser.Math.Linear(this.body.x, this.targetX, LERP_FACTOR);
    const newY = Phaser.Math.Linear(this.body.y, this.targetY, LERP_FACTOR);

    this.body.setPosition(newX, newY);
    this.nameLabel.setPosition(newX, newY - 34);

    // Atualiza o anel do jogador local (se existir)
    const ring = this.scene.children.getByName(`ring_${this.id}`) as Phaser.GameObjects.Arc | null;
    if (ring) ring.setPosition(newX, newY);

    // Atualiza balão de fala
    if (this.bubbleContainer) {
      this.bubbleContainer.setPosition(newX, newY - 60);
    }
  }

  /** Remove todos os objetos desta instância da cena */
  destroy(): void {
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    this.bubbleContainer?.destroy();
    this.nameLabel.destroy();
    this.body.destroy();

    const ring = this.scene.children.getByName(`ring_${this.id}`);
    ring?.destroy();
  }
}
