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
  private hasPowerUp = false;
  private maxPowerUpTime = 10000;
  // private imageIsLoaded = false;

  private boundaryDetection() {
    if (this.y > this.game.gameData.height - this.height) {
      this.y = this.game.gameData.height - this.height;
    }
    if (this.y < 0) {
      this.y = 0;
    }
  }

  public isPowerUpActive() {
    return this.hasPowerUp;
  }

  public powerUp() {
    if (this.hasPowerUp) return;

    this.hasPowerUp = true;
    this.game.soundController.play("powerUpSound");
    setTimeout(() => {
      // go back to normal animation after powerup finishes
      this.hasPowerUp = false;
      this.spriteAnimator.setAnimation(0, 37);
      this.game.gameData.ammo = this.game.gameData.maxAmmo;
      this.game.soundController.play("powerDownSound");
    }, this.maxPowerUpTime);
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

    if (this.hasPowerUp) {
      this.spriteAnimator.setAnimation(1, 37);
      this.game.gameData.ammo += 0.1;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.game.gameData.debugModeOn) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    // if (this.imageIsLoaded) {
    this.spriteAnimator.drawAnimation(ctx);
    // }
  }

  public shootTop() {
    if (this.game.gameData.ammo <= 0) return;

    this.game.soundController.play("shotSound");
    this.game.gameData.projectiles.push(
      new Projectile(this.game, this.x + this.width / 3, this.y + 20)
    );
    this.game.gameData.ammo--;
    this.shootBottom();
  }

  private shootBottom() {
    if (!this.hasPowerUp) return;
    this.game.gameData.projectiles.push(
      new Projectile(
        this.game,
        this.x + this.width / 3,
        this.y + this.height - 20
      )
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
    this.spriteAnimator.setAnimation(0, 37);
  }
}
