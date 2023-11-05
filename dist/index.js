// src/Enemy.ts
class Enemy {
  game;
  markedForDeletion = false;
  speedX;
  x;
  constructor(game) {
    this.game = game;
    this.x = this.game.gameData.width;
    this.speedX = Math.random() * 5 - 7;
  }
  update() {
    this.x += this.speedX;
    if (this.x + this.width < 0) {
      this.markedForDeletion = true;
    }
    if (Game2.checkCollision(this, this.game.getPlayer())) {
      this.markedForDeletion = true;
    }
  }
  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  isMarkedForDeletion() {
    return this.markedForDeletion;
  }
  decreaseLives() {
    this.lives--;
    if (this.lives <= 0) {
      this.markedForDeletion = true;
    }
  }
  getPoints() {
    return this.score;
  }
}

class Angler1 extends Enemy {
  y;
  width = 228;
  height = 169;
  lives = 3;
  score = this.lives;
  constructor(game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
  }
  draw(ctx) {
    super.draw(ctx);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`${this.lives}`, this.x + this.width / 2, this.y + this.height / 2);
  }
}

// src/InputHandler.ts
class InputHandler {
  game;
  constructor(game) {
    this.game = game;
    window.addEventListener("keydown", (e) => {
      if (e.key === KEYS.ArrowUp || e.key === KEYS.ArrowDown) {
        this.game.gameData.keys.add(e.key);
      }
      if (e.key === KEYS.Space) {
        this.game.getPlayer().shootTop();
      }
      if (e.key === KEYS.d) {
        this.game.toggleDebugMode();
      }
    });
    window.addEventListener("keyup", (e) => {
      this.game.gameData.keys.delete(e.key);
    });
  }
}

// src/assets/background/layer1.png
var layer1_default = "./layer1-a5d543d44d02327f.png";

// src/assets/background/layer2.png
var layer2_default = "./layer2-7fdeb97c7851fe1e.png";

// src/assets/background/layer3.png
var layer3_default = "./layer3-df96ff03c95483a4.png";

// src/assets/background/layer4.png
var layer4_default = "./layer4-ba1b5231103e2921.png";

// src/Layer.ts
class Layer {
  game;
  image;
  speedModifier;
  x;
  y;
  width;
  height;
  constructor(game, image, speedModifier) {
    this.game = game;
    this.image = image;
    this.speedModifier = speedModifier;
    this.x = 0;
    this.y = 0;
    this.width = 1768;
    this.height = 500;
  }
  update() {
    if (this.x < -this.width) {
      this.x = 0;
    }
    this.x -= this.game.gameData.gameSpeed * this.speedModifier;
  }
  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y);
    ctx.drawImage(this.image, this.x + this.width, this.y);
  }
}

class Background {
  game;
  layers = [];
  constructor(game) {
    this.game = game;
    this.createLayer(layer1_default, 0.2);
    this.createLayer(layer2_default, 0.4);
    this.createLayer(layer3_default, 1);
  }
  createLayer(filepath, speedModifier) {
    const image = new Image;
    image.src = filepath;
    image.onload = () => {
      this.layers.push(new Layer(this.game, image, speedModifier));
    };
  }
  update() {
    this.layers.forEach((layer) => layer.update());
  }
  draw(ctx) {
    this.layers.forEach((layer) => layer.draw(ctx));
  }
}

class Foregound {
  game;
  layers = [];
  constructor(game) {
    this.game = game;
    this.createLayer(layer4_default, 1.2);
  }
  createLayer(filepath, speedModifier) {
    const image = new Image;
    image.src = filepath;
    image.onload = () => {
      this.layers.push(new Layer(this.game, image, speedModifier));
    };
  }
  update() {
    this.layers.forEach((layer) => layer.update());
  }
  draw(ctx) {
    this.layers.forEach((layer) => layer.draw(ctx));
  }
}

// src/Projectile.ts
class Projectile {
  game;
  x;
  y;
  width = 10;
  height = 3;
  speedX = 3;
  markedForDeletion = false;
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
  }
  update() {
    this.x += this.speedX;
    if (this.x > this.game.gameData.width * 0.8) {
      this.markedForDeletion = true;
    }
  }
  draw(ctx) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  isMarkedForDeletion() {
    return this.markedForDeletion;
  }
  delete() {
    this.markedForDeletion = true;
  }
}

// src/assets/characters/player.png
var player_default = "./player-60530f842f44e2ac.png";

// src/utils/SpriteAnimator.ts
class SpriteAnimation {
  spriteData;
  numFrames = -1;
  animationRow = -1;
  gameLoopCounter = 0;
  staggerFrames;
  constructor(spriteData) {
    this.spriteData = spriteData;
    this.staggerFrames = spriteData.staggerFrames && spriteData.staggerFrames > 0 ? spriteData.staggerFrames : 5;
  }
  getAnimationFrame(rowIndex, columnIndex) {
    return [
      columnIndex * this.spriteData.spriteWidth,
      rowIndex * this.spriteData.spriteHeight,
      this.spriteData.spriteWidth,
      this.spriteData.spriteHeight
    ];
  }
  updatePosition(x, y) {
    this.spriteData.x = x;
    this.spriteData.y = y;
  }
  drawFrame(ctx, rowIndex, columnIndex) {
    ctx.drawImage(this.spriteData.spriteSrc, ...this.getAnimationFrame(rowIndex, columnIndex), this.spriteData.x, this.spriteData.y, this.spriteData.spriteWidth, this.spriteData.spriteHeight);
  }
  setAnimation(rowIndex, numFrames) {
    this.numFrames = numFrames;
    this.animationRow = rowIndex;
  }
  drawAnimation(ctx) {
    if (this.numFrames === -1 || this.animationRow === -1) {
      throw new Error("Animation not set");
    }
    const currentFrame = Math.floor(this.gameLoopCounter / this.staggerFrames) % this.numFrames;
    this.drawFrame(ctx, this.animationRow, currentFrame);
    this.gameLoopCounter++;
  }
}

// src/Player.ts
class Player {
  game;
  x = 20;
  y = 100;
  speedY = 0;
  width = 120;
  height = 190;
  maxSpeed = 10;
  image = new Image;
  spriteAnimator;
  imageIsLoaded = false;
  update() {
    if (this.game.gameData.keys.has(KEYS.ArrowUp)) {
      this.speedY -= 1;
    } else if (this.game.gameData.keys.has(KEYS.ArrowDown)) {
      this.speedY += 1;
    } else {
      this.speedY = 0;
    }
    this.y += this.speedY;
    this.spriteAnimator.updatePosition(this.x, this.y);
  }
  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    if (this.imageIsLoaded) {
      this.spriteAnimator.drawAnimation(ctx);
    }
  }
  shootTop() {
    if (this.game.gameData.ammo <= 0)
      return;
    this.game.gameData.projectiles.push(new Projectile(this.game, this.x, this.y));
    this.game.gameData.ammo--;
  }
  constructor(game) {
    this.game = game;
    this.image.src = player_default;
    this.spriteAnimator = new SpriteAnimation({
      spriteHeight: this.height,
      spriteWidth: this.width,
      spriteSrc: this.image,
      x: this.x,
      y: this.y
    });
    this.image.onload = () => {
      this.spriteAnimator.setAnimation(0, 37);
      this.imageIsLoaded = true;
      console.log(this.spriteAnimator);
    };
  }
}

// src/UI.ts
class UI {
  game;
  constructor(game) {
    this.game = game;
  }
  drawProjectileLoader(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(8, 40, this.game.gameData.width * 0.3, 40);
    ctx.fillStyle = "black";
    ctx.fillRect(8, 40, this.game.gameData.width * 0.3 * (this.game.gameData.ammo / this.game.gameData.maxAmmo), 40);
  }
  drawGameOver(ctx) {
    if (this.game.gameData.gameOver) {
      ctx.save();
      ctx.fillStyle = "white";
      ctx.font = "50px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", this.game.gameData.width / 2, this.game.gameData.height / 2);
      ctx.restore();
    }
  }
  drawScore(ctx) {
    ctx.save();
    ctx.fillStyle = "Yellow";
    ctx.font = "30px Arial";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(`Score: ${this.game.gameData.score}`, 8, 25);
    ctx.restore();
  }
  drawGameTimer(ctx) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`time: ${(this.game.gameData.gameTimer / 1000).toFixed(1)}`, 160, 25);
  }
  draw(ctx) {
    this.drawScore(ctx);
    this.drawProjectileLoader(ctx);
    this.drawGameOver(ctx);
    this.drawGameTimer(ctx);
  }
}

// src/utils/Updater.ts
class Updater {
  game;
  constructor(game) {
    this.game = game;
  }
  updateProjectiles() {
    this.game.gameData.projectiles.forEach((projectile) => {
      projectile.update();
      this.game.gameData.enemies.forEach((enemy) => {
        if (Game2.checkCollision(projectile, enemy)) {
          projectile.delete();
          enemy.decreaseLives();
          this.game.gameData.score += enemy.getPoints();
        }
      });
    });
  }
  deleteProjectiles() {
    this.game.gameData.projectiles = this.game.gameData.projectiles.filter((projectile) => !projectile.isMarkedForDeletion());
  }
  handlerAmmoTimer(deltaTime) {
    this.game.gameData.ammoTimer = this.game.timeDeltaHandler({
      deltaTime,
      timer: this.game.gameData.ammoTimer,
      maxTime: this.game.gameData.maxAmmoLoadTime,
      callback: () => {
        if (this.game.gameData.ammo < this.game.gameData.maxAmmo) {
          this.game.gameData.ammo++;
        }
      }
    });
  }
  updateEnemies() {
    this.game.gameData.enemies.forEach((enemy) => enemy.update());
  }
  deleteEnemies() {
    this.game.gameData.enemies = this.game.gameData.enemies.filter((enemy) => !enemy.isMarkedForDeletion());
  }
  handleEnemyTimer(deltaTime) {
    this.game.gameData.enemyTimer = this.game.timeDeltaHandler({
      deltaTime,
      timer: this.game.gameData.enemyTimer,
      maxTime: this.game.gameData.maxEnemyTimer,
      callback: () => {
        this.game.addEnemy();
      }
    });
  }
  handleGameTimer(deltaTime) {
    this.game.gameData.gameTimer = this.game.timeDeltaHandler({
      deltaTime,
      timer: this.game.gameData.gameTimer,
      maxTime: this.game.gameData.gameTimeLimit,
      callback: () => {
        this.game.gameData.gameOver = true;
      }
    });
  }
}

// src/Game.ts
class Game2 {
  width;
  height;
  ctx;
  player = new Player(this);
  inputHandler = new InputHandler(this);
  ui = new UI(this);
  updater = new Updater(this);
  background = new Background(this);
  foreground = new Foregound(this);
  gameData;
  lastTime = 0;
  constructor(width, height, ctx) {
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.gameData = {
      keys: new Set,
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
      gameTimeLimit: 30000,
      gameSpeed: 1,
      debugModeOn: false
    };
  }
  getPlayer() {
    return this.player;
  }
  toggleDebugMode() {
    this.gameData.debugModeOn = !this.gameData.debugModeOn;
  }
  update(deltaTime) {
    this.background.update();
    this.foreground.update();
    this.player.update();
    this.updater.updateProjectiles();
    this.updater.deleteProjectiles();
    this.updater.handlerAmmoTimer(deltaTime);
    this.updater.updateEnemies();
    this.updater.deleteEnemies();
    this.updater.handleEnemyTimer(deltaTime);
    this.updater.handleGameTimer(deltaTime);
  }
  timeDeltaHandler({
    callback,
    deltaTime,
    maxTime,
    timer
  }) {
    if (timer > maxTime) {
      callback();
      timer = 0;
    } else {
      timer += deltaTime;
    }
    return timer;
  }
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.background.draw(this.ctx);
    this.player.draw(this.ctx);
    this.foreground.draw(this.ctx);
    this.gameData.projectiles.forEach((projectile) => projectile.draw(this.ctx));
    this.gameData.enemies.forEach((enemy) => enemy.draw(this.ctx));
    this.ui.draw(this.ctx);
  }
  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.update(deltaTime);
    this.draw();
    if (this.gameData.gameOver)
      return;
    requestAnimationFrame((timestamp2) => this.loop(timestamp2));
  }
  addEnemy() {
    this.gameData.enemies.push(new Angler1(this));
  }
  async gameLoop() {
    this.lastTime = 0;
    this.loop(0);
  }
  static checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
  }
  getDeltaTime() {
    return new Promise((resolve) => {
      let lastTime = 0;
      let counter = 0;
      const deltaTimes = [];
      function loop(timestamp) {
        if (counter < 20) {
          const deltaTime = timestamp - lastTime;
          deltaTimes.push(deltaTime);
          lastTime = timestamp;
          counter++;
          requestAnimationFrame(loop);
        } else {
          resolve(deltaTimes.at(-1));
        }
      }
      requestAnimationFrame(loop);
    });
  }
}

// src/index.ts
var KEYSENUM;
(function(KEYSENUM2) {
  KEYSENUM2["ArrowUp"] = "ArrowUp";
  KEYSENUM2["ArrowDown"] = "ArrowDown";
  KEYSENUM2["Space"] = " ";
  KEYSENUM2["d"] = "d";
})(KEYSENUM || (KEYSENUM = {}));
window.KEYS = KEYSENUM;
var canvas = document.querySelector("canvas");
canvas.width = 1000;
canvas.height = 500;
var ctx = canvas.getContext("2d");
console.log(canvas.width, canvas.height);
var game = new Game2(canvas.width, canvas.height, ctx);
game.gameLoop();
