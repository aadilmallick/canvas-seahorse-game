import Game from "./Game";
import SpriteAnimation from "./utils/SpriteAnimator";

export default class Particle implements Renderable {
  x: number;
  y: number;
  width: number;
  height: number;
  private size: number;
  private speedX = Math.random() * 6 - 3;
  private speedY = Math.random() * 3 - 5;
  private sizeModifier = Math.random() * 0.5 + 0.5;
  private markedForDeletion = false;
  private angle = 0;
  private spriteAnimator: SpriteAnimation;

  private image = SpriteAnimation.loadImage("#particle");
  private frameX = Math.floor(Math.random() * 3);
  private frameY = Math.floor(Math.random() * 3);
  private bounced = false;
  private bottomBounceBoundary = Math.random() * 100 + 60;
  private gravity = -0.1;
  constructor(private game: Game, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.size = this.width * this.sizeModifier;
    this.spriteAnimator = new SpriteAnimation(this, {
      image: this.image,
      numRows: 3,
    });
  }

  update(): void {
    this.angle += (180 / Math.PI) * 0.1;
    this.speedY += -this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    if (
      this.y + this.height >
        this.game.gameData.height - this.bottomBounceBoundary &&
      !this.bounced
    ) {
      this.bounced = true;
      this.speedY *= -0.5;
    }
    if (
      this.y + this.height > this.game.gameData.height ||
      this.x > this.game.gameData.width
    ) {
      this.markedForDeletion = true;
    }
  }

  public isMarkedForDeletion() {
    return this.markedForDeletion;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x + this.width * 0.5, this.y + this.height * 0.5);
    ctx.rotate((Math.PI / 180) * this.angle);
    ctx.drawImage(
      this.image,
      this.frameX * this.width,
      this.frameY * this.height,
      this.width,
      this.height,
      // draw image with center on origin
      -this.width * 0.5,
      -this.height * 0.5,
      this.width,
      this.height
    );
    // this.spriteAnimator.drawFrame(ctx, this.frameX, this.frameY);
    // TODO: rotate gear
    ctx.restore();
  }
}
