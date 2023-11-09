/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// ! the problem with enums is that all type definitions in types.d.ts must be ambient, meaning they have no value
// ! enums can be directly used to access values, so they are more like objects than types.

declare enum KEYSENUM {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  Space = " ",
  d = "d",
}

declare var KEYS: typeof KEYSENUM;
window.KEYS = KEYSENUM;
declare module "*.png";
declare module "*.wav";

interface Renderable {
  update(deltaTime?: number): void;
  draw(ctx: CanvasRenderingContext2D, deltaTime?: number): void;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DrawManager {
  update(): void;
  draw(ctx: CanvasRenderingContext2D, deltaTime?: number): void;
}
