import Game from "./Game";
import Projectile from "./Projectile";
import player from "./assets/characters/player.png";
import SpriteAnimation from "./utils/SpriteAnimator";

export default class Player implements Renderable {
  public x = 20;
  public y = 100;
  private speedY = 0;
  public width = 120;
  public height = 190;
  private maxSpeed = 10;
  private image = new Image();
  private spriteAnimator!: SpriteAnimation;
  private imageIsLoaded = false;

  public update() {
    if (this.game.gameData.keys.has(KEYS.ArrowUp)) {
      this.speedY -= 1;
    } else if (this.game.gameData.keys.has(KEYS.ArrowDown)) {
      this.speedY += 1;
    } else {
      this.speedY = 0;
    }
    this.y += this.speedY;
    this.spriteAnimator.updatePosition(this.x, this.y);
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    if (this.imageIsLoaded) {
      this.spriteAnimator.drawAnimation(ctx);
    }
  }

  public shootTop() {
    if (this.game.gameData.ammo <= 0) return;

    this.game.gameData.projectiles.push(
      new Projectile(this.game, this.x, this.y)
    );
    this.game.gameData.ammo--;
  }

  constructor(private game: Game) {
    this.image.src = player;
    this.spriteAnimator = new SpriteAnimation({
      spriteHeight: this.height,
      spriteWidth: this.width,
      spriteSrc: this.image,
      x: this.x,
      y: this.y,
    });
    this.image.onload = () => {
      this.spriteAnimator.setAnimation(0, 37);
      this.imageIsLoaded = true;
      console.log(this.spriteAnimator);
    };
  }
}
