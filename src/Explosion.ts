import Game from "./Game";
import SpriteAnimation from "./utils/SpriteAnimator";

export abstract class Explosion implements Renderable {
  public width: number = 200;
  public height: number = 200;
  protected isMarkedForDeletion: boolean = false;
  protected spriteAnimator!: SpriteAnimation;
  constructor(protected game: Game, public x: number, public y: number) {}

  abstract update(deltaTime?: number): void;

  abstract draw(ctx: CanvasRenderingContext2D, deltaTime?: number): void;

  setMarkedForDeletion() {
    this.isMarkedForDeletion = true;
  }

  getIsMarkedForDeletion(): boolean {
    return this.isMarkedForDeletion;
  }
}

export class SmokeExplosion extends Explosion {
  constructor(game: Game, x: number, y: number) {
    super(game, x, y);
    const image = SpriteAnimation.loadImage("#smoke");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 1,
      staggerFrames: 3,
      numFrames: 8,
    });

    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
  }

  update(deltaTime?: number | undefined): void {
    this.x -= this.game.gameData.gameSpeed;
  }

  draw(ctx: CanvasRenderingContext2D, deltaTime?: number): void {
    // this.spriteAnimator.drawAnimation(ctx, 0);
    if (!deltaTime) {
      throw new Error("deltaTime not defined");
    }
    if (
      this.spriteAnimator.drawAnimationDeltaTime(ctx, {
        animationRow: 0,
        deltaTime,
        fps: 15,
      })
    ) {
      this.setMarkedForDeletion();
    }
  }
}

export class FireExplosion extends Explosion {
  constructor(game: Game, x: number, y: number) {
    super(game, x, y);
    const image = SpriteAnimation.loadImage("#fire");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 1,
      staggerFrames: 3,
      numFrames: 8,
    });

    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
  }

  update(deltaTime?: number | undefined): void {
    this.x -= this.game.gameData.gameSpeed;
  }

  draw(ctx: CanvasRenderingContext2D, deltaTime?: number): void {
    // this.spriteAnimator.drawAnimation(ctx, 0);
    if (!deltaTime) {
      throw new Error("deltaTime not defined");
    }
    if (
      this.spriteAnimator.drawAnimationDeltaTime(ctx, {
        animationRow: 0,
        deltaTime,
        fps: 15,
      })
    ) {
      this.setMarkedForDeletion();
    }
  }
}
