import Game from "./Game";

enum KEYSENUM {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  Space = " ",
  d = "d",
}

window.KEYS = KEYSENUM;

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = 1000;
canvas.height = 500;
const ctx = canvas.getContext("2d")!;

console.log(canvas.width, canvas.height);
const game = new Game(canvas.width, canvas.height, ctx);
game.gameLoop();
