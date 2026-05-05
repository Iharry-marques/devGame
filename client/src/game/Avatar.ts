import Phaser from 'phaser';

/**
 * Classe Avatar: Encapsula a representação visual geométrica do jogador.
 * Estende Phaser.GameObjects.Container para facilitar a movimentação e rotação de sub-elementos.
 */
export class Avatar extends Phaser.GameObjects.Container {
  private bodyRect: Phaser.GameObjects.Rectangle;
  private directionIndicator: Phaser.GameObjects.Triangle;
  private color: number;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    super(scene, x, y);
    this.color = color;

    // Corpo do Avatar (Quadrado)
    this.bodyRect = scene.add.rectangle(0, 0, 24, 24, color);
    this.bodyRect.setStrokeStyle(2, 0xffffff, 0.9);
    
    // Indicador de Direção (Triângulo)
    // 0=N, 1=S, 2=E, 3=W
    this.directionIndicator = scene.add.triangle(0, 0, 0, -8, -5, 2, 5, 2, 0xffffff, 0.8);
    this.directionIndicator.setY(0); // Posicionamento inicial

    this.add([this.bodyRect, this.directionIndicator]);
    scene.add.existing(this);
  }

  /**
   * Define a direção visual do avatar.
   * @param d Direção (0: Norte, 1: Sul, 2: Leste, 3: Oeste)
   */
  setDirection(d: number): void {
    const offset = 14;
    switch (d) {
      case 0: // North
        this.directionIndicator.setAngle(0);
        this.directionIndicator.setPosition(0, -offset);
        break;
      case 1: // South
        this.directionIndicator.setAngle(180);
        this.directionIndicator.setPosition(0, offset);
        break;
      case 2: // East
        this.directionIndicator.setAngle(90);
        this.directionIndicator.setPosition(offset, 0);
        break;
      case 3: // West
        this.directionIndicator.setAngle(270);
        this.directionIndicator.setPosition(-offset, 0);
        break;
    }
  }

  /** Altera a cor do corpo */
  setColor(color: number): void {
    this.color = color;
    this.bodyRect.setFillStyle(color);
  }
}
