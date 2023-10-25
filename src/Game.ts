import { Angler1, Enemy } from "./Enemy";
import InputHandler from "./InputHandler";
import Player from "./Player";
import Projectile from "./Projectile";
import Renderable from "./Renderable";
import UI from "./UI";
import { KEYS } from "./types";
import Updater from "./utils/Updater";

interface GameData {
  keys: Set<KEYS>;
  width: number;
  height: number;
  projectiles: Projectile[];
  ctx: CanvasRenderingContext2D;
  ammo: number;
  maxAmmo: number;
  maxAmmoLoadTime: number;
  ammoTimer: number;
  enemies: Enemy[];
  enemyTimer: number;
  maxEnemyTimer: number;
  score: number;
  gameOver: boolean;
  gameTimer: number;
  gameTimeLimit: number;
}

export default class Game {
  // other classes
  private player: Player;
  private inputHandler: InputHandler;
  private ui: UI;
  private updater = new Updater(this);

  // game data
  public gameData: GameData;
  private lastTime = 0;

  constructor(
    private width: number,
    private height: number,
    private ctx: CanvasRenderingContext2D
  ) {
    // instantiate other classes that need game data
    this.player = new Player(this);
    this.inputHandler = new InputHandler(this);
    this.ui = new UI(this);

    // instantiate gameData
    this.gameData = {
      keys: new Set(),
      width: this.width,
      height: this.height,
      projectiles: [],
      ctx: this.ctx,
      ammo: 20,
      maxAmmo: 50,
      maxAmmoLoadTime: 500,
      ammoTimer: 0,
      enemies: [],
      enemyTimer: 0,
      maxEnemyTimer: 1000,
      score: 0,
      gameOver: false,
      gameTimer: 0,
      gameTimeLimit: 10000,
    };
  }

  public getPlayer() {
    return this.player;
  }

  // run all the methods here that should be run on each frame
  private update(deltaTime: number) {
    this.player.update();
    // handle projectiles, check for collisions with enemies, delete projectiles
    this.updater.updateProjectiles();
    this.updater.deleteProjectiles();
    // add 1 ammo every 0.5 seconds
    this.updater.handlerAmmoTimer(deltaTime);

    // updating enemies and deleting enemies that should be deleted
    this.updater.updateEnemies();
    this.updater.deleteEnemies();

    // add 1 enemy every 1 second
    this.updater.handleEnemyTimer(deltaTime);

    // game over after 10 seconds
    this.updater.handleGameTimer(deltaTime);
  }

  public timeDeltaHandler({
    callback,
    deltaTime,
    maxTime,
    timer,
  }: {
    deltaTime: number;
    timer: number;
    maxTime: number;
    callback: () => void;
  }) {
    if (timer > maxTime) {
      callback();
      timer = 0;
    } else {
      timer += deltaTime;
    }
    return timer;
  }

  // all context drawing methods go in here
  private draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.player.draw(this.ctx);
    this.gameData.projectiles.forEach((projectile) =>
      projectile.draw(this.ctx)
    );

    this.gameData.enemies.forEach((enemy) => enemy.draw(this.ctx));

    this.ui.draw(this.ctx);
  }

  private loop(timestamp: number) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.update(deltaTime);
    this.draw();

    if (this.gameData.gameOver) return;
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  public addEnemy() {
    this.gameData.enemies.push(new Angler1(this));
  }

  public async gameLoop() {
    this.lastTime = 0;
    this.loop(0);
  }

  public static checkCollision(rect1: Renderable, rect2: Renderable): boolean {
    return (
      // check if same x zone roughly
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      // check if same y zone roughly
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  private getDeltaTime() {
    return new Promise<number>((resolve) => {
      let lastTime = 0;
      let counter = 0;
      const deltaTimes: number[] = [];

      function loop(timestamp: number) {
        if (counter < 20) {
          const deltaTime = timestamp - lastTime;
          deltaTimes.push(deltaTime);
          lastTime = timestamp;
          counter++;
          requestAnimationFrame(loop);
        } else {
          resolve(deltaTimes.at(-1)!);
        }
      }

      // do not call loop(). You should use requestAnimationFrame to not disturb event loop
      requestAnimationFrame(loop);
    });
  }

  //   public gameLoop
}
