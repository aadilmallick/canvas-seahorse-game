import Game from "./Game";
import SpriteAnimation from "./utils/SpriteAnimator";

// 1. create a shootTop() method in the Player class that is activated when hit space bar
// 2. shootTop() method adds projectile instance to gamedata projectile array
// 3. During animation update loop, modify the array to remove the projectiles marked for deletion
// 4. add ammo property to gamedata, preventing user from launching projectile if ammo is 0
// 5. In game draw(), loop through projectiles array and draw each projectile
// 6. In game update(), loop through projectiles array and update each projectile, then remove projectiles
//    that are marked for deletion

export default class Projectile implements Renderable {
  public width = 36.25;
  public height = 20;
  private speedX = 3;
  private markedForDeletion = false;
  private image: HTMLImageElement;
  private spriteAnimator!: SpriteAnimation;
  constructor(private game: Game, public x: number, public y: number) {
    this.image = SpriteAnimation.loadImage("#fireball");
    this.spriteAnimator = new SpriteAnimation(this, {
      image: this.image,
      numRows: 1,
      numFrames: 4,
    });
  }

  update(): void {
    this.x += this.speedX;
    if (this.x > this.game.gameData.width * 0.8) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.spriteAnimator.drawAnimation(ctx, 0);
  }

  public isMarkedForDeletion() {
    return this.markedForDeletion;
  }

  public delete() {
    this.markedForDeletion = true;
  }
}
