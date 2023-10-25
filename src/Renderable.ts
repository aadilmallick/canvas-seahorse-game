export default interface Renderable {
  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
  x: number;
  y: number;
  width: number;
  height: number;
}
