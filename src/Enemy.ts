import Game from "./Game";
import Renderable from "./Renderable";
import { drawPolygon } from "./utils/utils";

export abstract class Enemy implements Renderable {
  protected markedForDeletion = false;
  protected speedX: number;
  public x: number;
  public abstract y: number;
  public abstract width: number;
  public abstract height: number;
  protected abstract lives: number;
  protected abstract score: number;
  constructor(protected game: Game) {
    this.x = this.game.gameData.width;
    this.speedX = Math.random() * 5 - 7;
  }

  update(): void {
    this.x += this.speedX;
    if (this.x + this.width < 0) {
      this.markedForDeletion = true;
    }
    if (Game.checkCollision(this, this.game.getPlayer())) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  isMarkedForDeletion(): boolean {
    return this.markedForDeletion;
  }

  public decreaseLives() {
    this.lives--;
    if (this.lives <= 0) {
      this.markedForDeletion = true;
    }
  }

  public getPoints() {
    return this.score;
  }
}

export class Angler1 extends Enemy {
  public y: number;
  public width = 228;
  public height = 169;
  protected lives = 3;
  protected score = this.lives;
  constructor(game: Game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(
      `${this.lives}`,
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }
}
