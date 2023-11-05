import Game from "./Game";

import layer1 from "./assets/background/layer1.png";
import layer2 from "./assets/background/layer2.png";
import layer3 from "./assets/background/layer3.png";
import layer4 from "./assets/background/layer4.png";

// we stack images on top of each other to create illusion of multilayered background.
// each image must have same dimensions as each other or won't work. Height must be same as canvas height.
export class Layer implements Renderable {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(
    private game: Game,
    private image: CanvasImageSource,
    private speedModifier: number
  ) {
    this.x = 0;
    this.y = 0;
    // all layers have 1768 x 500 dimensions
    this.width = 1768;
    this.height = 500;
  }

  update() {
    // when background gets past left edge, reset for infinite looping background
    if (this.x < -this.width) {
      this.x = 0;
    }
    // parallax effect
    this.x -= this.game.gameData.gameSpeed * this.speedModifier;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.image, this.x, this.y);
    ctx.drawImage(this.image, this.x + this.width, this.y);
  }
}

export class Background implements DrawManager {
  private layers: Layer[] = [];

  constructor(private game: Game) {
    // background clouds. Scroll slowly
    this.createLayer(layer1, 0.2);
    // background city. Scroll slowly
    this.createLayer(layer2, 0.4);
    // game platform ground. Scroll with game speed
    this.createLayer(layer3, 1);
  }

  private createLayer(filepath: string, speedModifier: number) {
    const image = new Image();
    image.src = filepath;
    image.onload = () => {
      this.layers.push(new Layer(this.game, image, speedModifier));
    };
  }

  update(): void {
    this.layers.forEach((layer) => layer.update());
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.layers.forEach((layer) => layer.draw(ctx));
  }
}

export class Foregound implements DrawManager {
  private layers: Layer[] = [];

  constructor(private game: Game) {
    // foreground gears. Scroll fast
    this.createLayer(layer4, 1.2);
  }

  private createLayer(filepath: string, speedModifier: number) {
    const image = new Image();
    image.src = filepath;
    image.onload = () => {
      this.layers.push(new Layer(this.game, image, speedModifier));
    };
  }

  update(): void {
    this.layers.forEach((layer) => layer.update());
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.layers.forEach((layer) => layer.draw(ctx));
  }
}
