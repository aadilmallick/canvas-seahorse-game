import Game from "./Game";
import SpriteAnimation from "./utils/SpriteAnimator";

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
      // if player collides with lucky fish, power up
      if (this instanceof LuckyFish) {
        this.game.player.powerUp();
      }

      this.game.gameData.shield.turnShieldOn();
      this.game.soundController.play("shieldSound");

      this.game.soundController.play("hitSound");

      // launch gears, explosion
      this.game.createParticles(
        5,
        this.x + this.width * 0.5,
        this.y + this.height * 0.5
      );
      this.game.addExplosion(this);

      // decrease player score
      this.game.gameData.score -= this.score;
    }
  }

  debugDraw(ctx: CanvasRenderingContext2D): void {
    if (this.game.gameData.debugModeOn) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(
        `${this.lives}`,
        this.x + this.width / 2,
        this.y + this.height / 2
      );
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

  public isDead() {
    return this.lives <= 0;
  }

  public getPoints() {
    return this.score;
  }
}

export class Angler1 extends Enemy {
  public y: number;
  public width = 228;
  public height = 169;
  protected lives = 2;
  protected score = this.lives;
  private spriteAnimator!: SpriteAnimation;
  constructor(game: Game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);

    const image = document.getElementById(
      "angler-1"
    ) as HTMLImageElement | null;
    if (!image) throw new Error("Image not found");

    this.spriteAnimator = new SpriteAnimation(this, {
      image: image,
      numRows: 3,
    });
    // set random animation
    this.spriteAnimator.setAnimation(Math.floor(Math.random() * 3), 37);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.spriteAnimator.drawAnimation(ctx);
    this.debugDraw(ctx);
  }
}

export class Angler2 extends Enemy {
  public y: number;
  public width = 213;
  public height = 165;
  protected lives = 3;
  protected score = this.lives;
  private spriteAnimator!: SpriteAnimation;
  constructor(game: Game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);

    const image = document.getElementById(
      "angler-2"
    ) as HTMLImageElement | null;
    if (!image) throw new Error("Image not found");

    this.spriteAnimator = new SpriteAnimation(this, {
      image: image,
      numRows: 2,
    });
    // set random animation
    this.spriteAnimator.setAnimation(Math.floor(Math.random() * 2), 37);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.spriteAnimator.drawAnimation(ctx);
    this.debugDraw(ctx);
  }
}

export class LuckyFish extends Enemy {
  public y: number;
  public width = 99;
  public height = 95;
  protected lives = 1;
  protected score = 15;
  private spriteAnimator!: SpriteAnimation;
  constructor(game: Game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);

    const image = document.getElementById("lucky") as HTMLImageElement | null;
    if (!image) throw new Error("Image not found");

    this.spriteAnimator = new SpriteAnimation(this, {
      image: image,
      numRows: 2,
    });
    // set random animation
    this.spriteAnimator.setAnimation(Math.floor(Math.random() * 2), 37);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.spriteAnimator.drawAnimation(ctx);
    this.debugDraw(ctx);
  }
}

export class HiveWhale extends Enemy {
  public y: number;
  public width = 400;
  public height = 227;
  protected lives = 15;
  protected score = 15;
  private spriteAnimator!: SpriteAnimation;
  constructor(game: Game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);

    const image = SpriteAnimation.loadImage("#hivewhale");
    this.spriteAnimator = new SpriteAnimation(this, {
      image: image,
      numRows: 1,
    });
    // set random animation
    this.spriteAnimator.setAnimation(0, 37);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.spriteAnimator.drawAnimation(ctx);
    this.debugDraw(ctx);
  }
}

export class Drone extends Enemy {
  public y: number;
  public width = 115;
  public height = 95;
  protected lives = 1;
  protected score = 2;
  private spriteAnimator!: SpriteAnimation;

  // drones only appear when hive whale is destroyed, so must pass coordinates of destruction
  constructor(game: Game, x: number, y: number) {
    super(game);
    this.x = x;
    this.y = y;
    this.speedX = Math.random() * 5 - 10;

    const image = SpriteAnimation.loadImage("#drone");
    this.spriteAnimator = new SpriteAnimation(this, {
      image: image,
      numRows: 2,
    });
    // set random animation
    this.spriteAnimator.setAnimation(Math.floor(Math.random() * 2), 37);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.spriteAnimator.drawAnimation(ctx);
    this.debugDraw(ctx);
  }
}

export class BulbWhale extends Enemy {
  public y: number;
  public width = 270;
  public height = 219;
  protected lives = 20;
  protected score = this.lives;
  private spriteAnimator!: SpriteAnimation;
  constructor(game: Game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
    this.speedX = Math.random() * 2 - 3;

    const image = SpriteAnimation.loadImage("#bulbwhale");
    this.spriteAnimator = new SpriteAnimation(this, {
      image: image,
      numRows: 2,
      numFrames: 37,
      staggerFrames: 1,
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.spriteAnimator.drawAnimation(ctx, 0);
    this.debugDraw(ctx);
  }
}

export class MoonFish extends Enemy {
  public y: number;
  public width = 227;
  public height = 240;
  protected lives = 10;
  protected score = this.lives;
  private spriteAnimator!: SpriteAnimation;
  constructor(game: Game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
    this.speedX = Math.random() * 2 - 7;

    const image = SpriteAnimation.loadImage("#moonfish");
    this.spriteAnimator = new SpriteAnimation(this, {
      image: image,
      numRows: 2,
      numFrames: 37,
      staggerFrames: 1,
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.spriteAnimator.drawAnimation(ctx, 0);
    this.debugDraw(ctx);
  }
}

export class Stalker extends Enemy {
  public y: number;
  public width = 256;
  public height = 123;
  protected lives = 5;
  protected score = this.lives;
  private spriteAnimator!: SpriteAnimation;
  constructor(game: Game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);

    const image = SpriteAnimation.loadImage("#stalker");
    this.spriteAnimator = new SpriteAnimation(this, {
      image: image,
      numRows: 1,
      numFrames: 37,
      staggerFrames: 1,
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.spriteAnimator.drawAnimation(ctx, 0);
    this.debugDraw(ctx);
  }
}

export class RazorFin extends Enemy {
  public y: number;
  public width = 197;
  public height = 149;
  protected lives = 5;
  protected score = this.lives;
  private spriteAnimator!: SpriteAnimation;
  constructor(game: Game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);

    const image = SpriteAnimation.loadImage("#razorfin");
    this.spriteAnimator = new SpriteAnimation(this, {
      image: image,
      numRows: 1,
      numFrames: 37,
      staggerFrames: 1,
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.spriteAnimator.drawAnimation(ctx, 0);
    this.debugDraw(ctx);
  }
}
