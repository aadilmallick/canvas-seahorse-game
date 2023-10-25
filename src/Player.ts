import Game from "./Game";
import Projectile from "./Projectile";
import Renderable from "./Renderable";
import { KEYS } from "./types";

export default class Player implements Renderable {
  public x = 20;
  public y = 100;
  private speedY = 0;
  public width = 120;
  public height = 190;
  private maxSpeed = 10;

  public update() {
    if (this.game.gameData.keys.has(KEYS.ArrowUp)) {
      this.speedY -= 1;
    } else if (this.game.gameData.keys.has(KEYS.ArrowDown)) {
      this.speedY += 1;
    } else {
      this.speedY = 0;
    }
    this.y += this.speedY;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  public shootTop() {
    if (this.game.gameData.ammo <= 0) return;

    this.game.gameData.projectiles.push(
      new Projectile(this.game, this.x, this.y)
    );
    this.game.gameData.ammo--;
  }

  constructor(private game: Game) {}
}
