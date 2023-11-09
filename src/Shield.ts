import Game from "./Game";
import SpriteAnimation from "./utils/SpriteAnimator";

export default class Shield implements Renderable {
  width: number;
  height: number;
  x: number;
  y: number;
  spriteAnimator: SpriteAnimation;
  isPlaying: boolean = false;
  constructor(private game: Game) {
    this.width = this.game.player.width;
    this.height = this.game.player.height;
    this.x = this.game.player.x;
    this.y = this.game.player.y;

    const image = SpriteAnimation.loadImage("#shield");
    this.spriteAnimator = new SpriteAnimation(this, {
      image: image,
      numRows: 1,
      numFrames: 20,
      staggerFrames: 5,
    });
  }

  update(): void {
    this.x = this.game.player.x;
    this.y = this.game.player.y;
  }

  turnShieldOn(): void {
    this.isPlaying = true;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // shield animation is only played when the player is hit, and one-off
    if (this.isPlaying) {
      if (this.spriteAnimator.drawAnimationOneOff(ctx, 0)) {
        this.isPlaying = false;
      }
    }
  }
}
