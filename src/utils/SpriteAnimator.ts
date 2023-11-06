interface SpriteData {
  image: CanvasImageSource;
  staggerFrames?: number;
  numRows: number;
}

export default class SpriteAnimation {
  private numFrames: number = -1;
  private animationRow: number = -1;
  private gameLoopCounter: number = 0;
  private staggerFrames: number;
  constructor(private character: Renderable, private spriteData: SpriteData) {
    this.staggerFrames =
      spriteData.staggerFrames && spriteData.staggerFrames > 0
        ? spriteData.staggerFrames
        : 5;
  }

  // return coordinates of the specific sprite frame in the sprite sheet
  private getAnimationFrame(rowIndex: number, columnIndex: number) {
    return [
      columnIndex * this.character.width,
      rowIndex * this.character.height,
      this.character.width,
      this.character.height,
    ] as [number, number, number, number];
  }

  updatePosition(x: number, y: number) {
    this.character.x = x;
    this.character.y = y;
  }

  drawFrame(
    ctx: CanvasRenderingContext2D,
    rowIndex: number,
    columnIndex: number
  ) {
    ctx.drawImage(
      this.spriteData.image,
      ...this.getAnimationFrame(rowIndex, columnIndex),
      this.character.x,
      this.character.y,
      this.character.width,
      this.character.height
    );
  }

  setAnimation(rowIndex: number, numFrames: number) {
    if (rowIndex < 0 || rowIndex >= this.spriteData.numRows) {
      throw new Error("Invalid row index");
    }
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
