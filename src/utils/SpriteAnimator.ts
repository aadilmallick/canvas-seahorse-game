interface SpriteData {
  image: CanvasImageSource;
  staggerFrames?: number;
  numRows: number;
  numFrames?: number;
}

export default class SpriteAnimation {
  private numFrames: number = -1;
  private animationRow: number = -1;
  private gameLoopCounter: number = 0;
  private staggerFrames: number;
  private image: CanvasImageSource;
  private animationTimer: number = 0;
  private currentFrame = 0;

  private framesInSpriteSheet?: number;
  constructor(private character: Renderable, private spriteData: SpriteData) {
    this.image = spriteData.image;
    this.staggerFrames =
      spriteData.staggerFrames && spriteData.staggerFrames > 0
        ? spriteData.staggerFrames
        : 5;

    if (spriteData.numFrames) {
      // the entire sprite sheet has same number of frames for each animation
      this.framesInSpriteSheet = spriteData.numFrames;
    }
  }

  static loadImage(querySelector: string) {
    const image = document.querySelector(querySelector) as HTMLImageElement;
    if (!image) throw new Error("Image not found");
    return image;
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
    columnIndex: number,
    sizeMultiplier?: number
  ) {
    const sm =
      sizeMultiplier !== undefined && sizeMultiplier > 0 ? sizeMultiplier : 1;
    ctx.drawImage(
      this.image,
      ...this.getAnimationFrame(rowIndex, columnIndex),
      this.character.x,
      this.character.y,
      this.character.width * sm,
      this.character.height * sm
    );
  }

  setAnimation(rowIndex: number, numFrames: number) {
    if (rowIndex < 0 || rowIndex >= this.spriteData.numRows) {
      throw new Error("Invalid row index");
    }
    this.numFrames = numFrames;
    this.animationRow = rowIndex;
  }

  private animateWithCompleteSpriteSheet(
    ctx: CanvasRenderingContext2D,
    animationRow: number
  ) {
    if (animationRow >= 0 && animationRow < this.spriteData.numRows) {
      if (!this.framesInSpriteSheet) {
        throw new Error("Frames in sprite sheet not set");
      }

      const currentFrame =
        Math.floor(this.gameLoopCounter / this.staggerFrames) %
        this.framesInSpriteSheet;
      this.drawFrame(ctx, animationRow, currentFrame);

      this.gameLoopCounter++;

      if (currentFrame === this.framesInSpriteSheet - 1) {
        return true;
      }
      return false;
    }

    throw new Error("Invalid animation row");
  }

  private animateWithIncompleteSpriteSheet(ctx: CanvasRenderingContext2D) {
    if (this.numFrames === -1 || this.animationRow === -1) {
      throw new Error("Animation not set");
    }

    const currentFrame =
      Math.floor(this.gameLoopCounter / this.staggerFrames) % this.numFrames;
    this.drawFrame(ctx, this.animationRow, currentFrame);

    this.gameLoopCounter++;

    if (currentFrame === this.numFrames - 1) {
      return true;
    }
    return false;
  }

  drawAnimation(ctx: CanvasRenderingContext2D): boolean;
  drawAnimation(ctx: CanvasRenderingContext2D, animationRow: number): boolean;
  drawAnimation(ctx: CanvasRenderingContext2D, animationRow?: number) {
    if (animationRow !== undefined) {
      return this.animateWithCompleteSpriteSheet(ctx, animationRow);
    }

    return this.animateWithIncompleteSpriteSheet(ctx);
  }

  drawAnimationDeltaTime(
    ctx: CanvasRenderingContext2D,
    options: {
      animationRow?: number;
      deltaTime: number;
      fps: number;
    }
  ) {
    const spriteSheetIsComplete =
      options.animationRow !== undefined &&
      options.animationRow >= 0 &&
      options.animationRow < this.spriteData.numRows;
    // reset timer
    if (this.animationTimer > 1000 / options.fps) {
      this.currentFrame =
        (this.currentFrame + 1) %
        (spriteSheetIsComplete ? this.framesInSpriteSheet! : this.numFrames);
      this.animationTimer = 0;
    } else {
      // increment time
      this.animationTimer += options.deltaTime;
    }
    // complete spritesheet option
    if (
      options.animationRow !== undefined &&
      options.animationRow >= 0 &&
      options.animationRow < this.spriteData.numRows
    ) {
      if (!this.framesInSpriteSheet) {
        throw new Error("Frames in sprite sheet not set");
      }

      this.drawFrame(ctx, options.animationRow, this.currentFrame);

      if (this.currentFrame === this.framesInSpriteSheet - 1) {
        return true;
      }

      return false;
    }

    // incomplete spritesheet option
    if (this.numFrames === -1 || this.animationRow === -1) {
      throw new Error("Animation not set");
    }

    this.drawFrame(ctx, this.animationRow, this.currentFrame);

    if (this.currentFrame === this.numFrames - 1) {
      return true;
    }

    return false;
  }

  drawAnimationOneOff(ctx: CanvasRenderingContext2D, animationRow?: number) {
    if (animationRow !== undefined) {
      const isComplete = this.animateWithCompleteSpriteSheet(ctx, animationRow);
      if (isComplete) {
        this.gameLoopCounter = 0;
      }
      return isComplete;
    }

    const isComplete = this.animateWithIncompleteSpriteSheet(ctx);
    if (isComplete) {
      this.gameLoopCounter = 0;
    }
    return isComplete;
  }
}
