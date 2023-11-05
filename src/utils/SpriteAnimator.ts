interface SpriteData {
  spriteWidth: number;
  spriteHeight: number;
  spriteSrc: CanvasImageSource;
  x: number;
  y: number;
  staggerFrames?: number;
}

export default class SpriteAnimation {
  private numFrames: number = -1;
  private animationRow: number = -1;
  private gameLoopCounter: number = 0;
  private staggerFrames: number;
  constructor(private spriteData: SpriteData) {
    this.staggerFrames =
      spriteData.staggerFrames && spriteData.staggerFrames > 0
        ? spriteData.staggerFrames
        : 5;
  }

  // return coordinates of the specific sprite frame in the sprite sheet
  private getAnimationFrame(rowIndex: number, columnIndex: number) {
    return [
      columnIndex * this.spriteData.spriteWidth,
      rowIndex * this.spriteData.spriteHeight,
      this.spriteData.spriteWidth,
      this.spriteData.spriteHeight,
    ] as [number, number, number, number];
  }

  updatePosition(x: number, y: number) {
    this.spriteData.x = x;
    this.spriteData.y = y;
  }

  drawFrame(
    ctx: CanvasRenderingContext2D,
    rowIndex: number,
    columnIndex: number
  ) {
    ctx.drawImage(
      this.spriteData.spriteSrc,
      ...this.getAnimationFrame(rowIndex, columnIndex),
      this.spriteData.x,
      this.spriteData.y,
      this.spriteData.spriteWidth,
      this.spriteData.spriteHeight
    );
  }

  setAnimation(rowIndex: number, numFrames: number) {
    this.numFrames = numFrames;
    this.animationRow = rowIndex;
  }

  drawAnimation(ctx: CanvasRenderingContext2D) {
    if (this.numFrames === -1 || this.animationRow === -1) {
      throw new Error("Animation not set");
    }

    const currentFrame =
      Math.floor(this.gameLoopCounter / this.staggerFrames) % this.numFrames;
    this.drawFrame(ctx, this.animationRow, currentFrame);

    this.gameLoopCounter++;
  }
}
