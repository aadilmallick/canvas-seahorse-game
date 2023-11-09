import Game from "./Game";

export default class UI {
  constructor(private game: Game) {}

  drawProjectileLoader(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "white";
    ctx.fillRect(8, 40, this.game.gameData.width * 0.3, 40);
    ctx.fillStyle = "black";
    if (this.game.player.isPowerUpActive()) {
      ctx.fillStyle = "orange";
    }
    ctx.fillRect(
      8,
      40,
      this.game.gameData.width *
        0.3 *
        (this.game.gameData.ammo / this.game.gameData.maxAmmo),
      40
    );
  }

  drawGameOver(ctx: CanvasRenderingContext2D): void {
    if (this.game.gameData.gameOver) {
      let message = "You lost. Better luck next time!";

      if (this.game.gameData.score > this.game.gameData.winningScore) {
        message = "You won!";
      }
      ctx.save();
      ctx.fillStyle = "white";
      ctx.font = this.game.fonts.fontLarge;
      ctx.textAlign = "center";
      ctx.fillText(
        message,
        this.game.gameData.width / 2,
        this.game.gameData.height / 2
      );
      ctx.restore();
    }
  }

  drawScore(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = "Yellow";
    ctx.font = this.game.fonts.fontMedium;
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(`Score: ${this.game.gameData.score}`, 8, 25);
    ctx.restore();
  }

  drawGameTimer(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "white";
    ctx.font = this.game.fonts.fontSmall;
    ctx.fillText(
      `time: ${(this.game.gameData.gameTimer / 1000).toFixed(1)}`,
      160,
      25
    );
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawScore(ctx);
    this.drawProjectileLoader(ctx);
    this.drawGameOver(ctx);
    this.drawGameTimer(ctx);
  }
}
