import Game from "./Game";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = 1500;
canvas.height = 800;
const ctx = canvas.getContext("2d")!;

console.log(canvas.width, canvas.height);
const game = new Game(canvas.width, canvas.height, ctx);
game.gameLoop();
