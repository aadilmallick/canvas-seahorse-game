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

  private boundaryDetection() {
    if (this.y > this.game.gameData.height - this.height) {
      this.y = this.game.gameData.height - this.height;
    }
    if (this.y < 0) {
      this.y = 0;
    }
  }

  public update() {
    if (this.game.gameData.keys.has(KEYS.ArrowUp)) {
      this.speedY -= 1;
    } else if (this.game.gameData.keys.has(KEYS.ArrowDown)) {
      this.speedY += 1;
    } else {
      this.speedY = 0;
    }
    this.y += this.speedY;
    this.boundaryDetection();
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.game.gameData.debugModeOn) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
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
    this.spriteAnimator = new SpriteAnimation(this, {
      image: this.image,
      numRows: 2,
      staggerFrames: 1,
    });
    this.image.onload = () => {
      this.spriteAnimator.setAnimation(0, 37);
      this.imageIsLoaded = true;
      console.log(this.spriteAnimator);
    };
  }
}
