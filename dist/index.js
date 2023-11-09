// src/utils/SpriteAnimator.ts
class SpriteAnimation {
  character;
  spriteData;
  numFrames = -1;
  animationRow = -1;
  gameLoopCounter = 0;
  staggerFrames;
  image;
  animationTimer = 0;
  currentFrame = 0;
  framesInSpriteSheet;
  constructor(character, spriteData) {
    this.character = character;
    this.spriteData = spriteData;
    this.image = spriteData.image;
    this.staggerFrames = spriteData.staggerFrames && spriteData.staggerFrames > 0 ? spriteData.staggerFrames : 5;
    if (spriteData.numFrames) {
      this.framesInSpriteSheet = spriteData.numFrames;
    }
  }
  static loadImage(querySelector) {
    const image = document.querySelector(querySelector);
    if (!image)
      throw new Error("Image not found");
    return image;
  }
  getAnimationFrame(rowIndex, columnIndex) {
    return [
      columnIndex * this.character.width,
      rowIndex * this.character.height,
      this.character.width,
      this.character.height
    ];
  }
  updatePosition(x, y) {
    this.character.x = x;
    this.character.y = y;
  }
  drawFrame(ctx, rowIndex, columnIndex, sizeMultiplier) {
    const sm = sizeMultiplier !== undefined && sizeMultiplier > 0 ? sizeMultiplier : 1;
    ctx.drawImage(this.image, ...this.getAnimationFrame(rowIndex, columnIndex), this.character.x, this.character.y, this.character.width * sm, this.character.height * sm);
  }
  setAnimation(rowIndex, numFrames) {
    if (rowIndex < 0 || rowIndex >= this.spriteData.numRows) {
      throw new Error("Invalid row index");
    }
    this.numFrames = numFrames;
    this.animationRow = rowIndex;
  }
  animateWithCompleteSpriteSheet(ctx, animationRow) {
    if (animationRow >= 0 && animationRow < this.spriteData.numRows) {
      if (!this.framesInSpriteSheet) {
        throw new Error("Frames in sprite sheet not set");
      }
      const currentFrame = Math.floor(this.gameLoopCounter / this.staggerFrames) % this.framesInSpriteSheet;
      this.drawFrame(ctx, animationRow, currentFrame);
      this.gameLoopCounter++;
      if (currentFrame === this.framesInSpriteSheet - 1) {
        return true;
      }
      return false;
    }
    throw new Error("Invalid animation row");
  }
  animateWithIncompleteSpriteSheet(ctx) {
    if (this.numFrames === -1 || this.animationRow === -1) {
      throw new Error("Animation not set");
    }
    const currentFrame = Math.floor(this.gameLoopCounter / this.staggerFrames) % this.numFrames;
    this.drawFrame(ctx, this.animationRow, currentFrame);
    this.gameLoopCounter++;
    if (currentFrame === this.numFrames - 1) {
      return true;
    }
    return false;
  }
  drawAnimation(ctx, animationRow) {
    if (animationRow !== undefined) {
      return this.animateWithCompleteSpriteSheet(ctx, animationRow);
    }
    return this.animateWithIncompleteSpriteSheet(ctx);
  }
  drawAnimationDeltaTime(ctx, options) {
    const spriteSheetIsComplete = options.animationRow !== undefined && options.animationRow >= 0 && options.animationRow < this.spriteData.numRows;
    if (this.animationTimer > 1000 / options.fps) {
      this.currentFrame = (this.currentFrame + 1) % (spriteSheetIsComplete ? this.framesInSpriteSheet : this.numFrames);
      this.animationTimer = 0;
    } else {
      this.animationTimer += options.deltaTime;
    }
    if (options.animationRow !== undefined && options.animationRow >= 0 && options.animationRow < this.spriteData.numRows) {
      if (!this.framesInSpriteSheet) {
        throw new Error("Frames in sprite sheet not set");
      }
      this.drawFrame(ctx, options.animationRow, this.currentFrame);
      if (this.currentFrame === this.framesInSpriteSheet - 1) {
        return true;
      }
      return false;
    }
    if (this.numFrames === -1 || this.animationRow === -1) {
      throw new Error("Animation not set");
    }
    this.drawFrame(ctx, this.animationRow, this.currentFrame);
    if (this.currentFrame === this.numFrames - 1) {
      return true;
    }
    return false;
  }
  drawAnimationOneOff(ctx, animationRow) {
    if (animationRow !== undefined) {
      const isComplete2 = this.animateWithCompleteSpriteSheet(ctx, animationRow);
      if (isComplete2) {
        this.gameLoopCounter = 0;
      }
      return isComplete2;
    }
    const isComplete = this.animateWithIncompleteSpriteSheet(ctx);
    if (isComplete) {
      this.gameLoopCounter = 0;
    }
    return isComplete;
  }
}

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
      if (this instanceof LuckyFish) {
        this.game.player.powerUp();
      }
      this.game.gameData.shield.turnShieldOn();
      this.game.soundController.play("shieldSound");
      this.game.soundController.play("hitSound");
      this.game.createParticles(5, this.x + this.width * 0.5, this.y + this.height * 0.5);
      this.game.addExplosion(this);
      this.game.gameData.score -= this.score;
    }
  }
  debugDraw(ctx) {
    if (this.game.gameData.debugModeOn) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(`${this.lives}`, this.x + this.width / 2, this.y + this.height / 2);
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
  isDead() {
    return this.lives <= 0;
  }
  getPoints() {
    return this.score;
  }
}

class Angler1 extends Enemy {
  y;
  width = 228;
  height = 169;
  lives = 2;
  score = this.lives;
  spriteAnimator;
  constructor(game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
    const image = document.getElementById("angler-1");
    if (!image)
      throw new Error("Image not found");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 3
    });
    this.spriteAnimator.setAnimation(Math.floor(Math.random() * 3), 37);
  }
  draw(ctx) {
    this.spriteAnimator.drawAnimation(ctx);
    this.debugDraw(ctx);
  }
}

class Angler2 extends Enemy {
  y;
  width = 213;
  height = 165;
  lives = 3;
  score = this.lives;
  spriteAnimator;
  constructor(game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
    const image = document.getElementById("angler-2");
    if (!image)
      throw new Error("Image not found");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 2
    });
    this.spriteAnimator.setAnimation(Math.floor(Math.random() * 2), 37);
  }
  draw(ctx) {
    this.spriteAnimator.drawAnimation(ctx);
    this.debugDraw(ctx);
  }
}

class LuckyFish extends Enemy {
  y;
  width = 99;
  height = 95;
  lives = 1;
  score = 15;
  spriteAnimator;
  constructor(game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
    const image = document.getElementById("lucky");
    if (!image)
      throw new Error("Image not found");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 2
    });
    this.spriteAnimator.setAnimation(Math.floor(Math.random() * 2), 37);
  }
  draw(ctx) {
    this.spriteAnimator.drawAnimation(ctx);
    this.debugDraw(ctx);
  }
}

class HiveWhale extends Enemy {
  y;
  width = 400;
  height = 227;
  lives = 15;
  score = 15;
  spriteAnimator;
  constructor(game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
    const image = SpriteAnimation.loadImage("#hivewhale");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 1
    });
    this.spriteAnimator.setAnimation(0, 37);
  }
  draw(ctx) {
    this.spriteAnimator.drawAnimation(ctx);
    this.debugDraw(ctx);
  }
}

class Drone extends Enemy {
  y;
  width = 115;
  height = 95;
  lives = 1;
  score = 2;
  spriteAnimator;
  constructor(game, x, y) {
    super(game);
    this.x = x;
    this.y = y;
    this.speedX = Math.random() * 5 - 10;
    const image = SpriteAnimation.loadImage("#drone");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 2
    });
    this.spriteAnimator.setAnimation(Math.floor(Math.random() * 2), 37);
  }
  draw(ctx) {
    this.spriteAnimator.drawAnimation(ctx);
    this.debugDraw(ctx);
  }
}

class BulbWhale extends Enemy {
  y;
  width = 270;
  height = 219;
  lives = 20;
  score = this.lives;
  spriteAnimator;
  constructor(game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
    this.speedX = Math.random() * 2 - 3;
    const image = SpriteAnimation.loadImage("#bulbwhale");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 2,
      numFrames: 37,
      staggerFrames: 1
    });
  }
  draw(ctx) {
    this.spriteAnimator.drawAnimation(ctx, 0);
    this.debugDraw(ctx);
  }
}

class MoonFish extends Enemy {
  y;
  width = 227;
  height = 240;
  lives = 10;
  score = this.lives;
  spriteAnimator;
  constructor(game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
    this.speedX = Math.random() * 2 - 7;
    const image = SpriteAnimation.loadImage("#moonfish");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 2,
      numFrames: 37,
      staggerFrames: 1
    });
  }
  draw(ctx) {
    this.spriteAnimator.drawAnimation(ctx, 0);
    this.debugDraw(ctx);
  }
}

class Stalker extends Enemy {
  y;
  width = 256;
  height = 123;
  lives = 5;
  score = this.lives;
  spriteAnimator;
  constructor(game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
    const image = SpriteAnimation.loadImage("#stalker");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 1,
      numFrames: 37,
      staggerFrames: 1
    });
  }
  draw(ctx) {
    this.spriteAnimator.drawAnimation(ctx, 0);
    this.debugDraw(ctx);
  }
}

class RazorFin extends Enemy {
  y;
  width = 197;
  height = 149;
  lives = 5;
  score = this.lives;
  spriteAnimator;
  constructor(game) {
    super(game);
    this.y = Math.random() * (this.game.gameData.height * 0.9 - this.height);
    const image = SpriteAnimation.loadImage("#razorfin");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 1,
      numFrames: 37,
      staggerFrames: 1
    });
  }
  draw(ctx) {
    this.spriteAnimator.drawAnimation(ctx, 0);
    this.debugDraw(ctx);
  }
}

// src/Explosion.ts
class Explosion {
  game;
  x;
  y;
  width = 200;
  height = 200;
  isMarkedForDeletion = false;
  spriteAnimator;
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
  }
  setMarkedForDeletion() {
    this.isMarkedForDeletion = true;
  }
  getIsMarkedForDeletion() {
    return this.isMarkedForDeletion;
  }
}

class SmokeExplosion extends Explosion {
  constructor(game, x, y) {
    super(game, x, y);
    const image = SpriteAnimation.loadImage("#smoke");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 1,
      staggerFrames: 3,
      numFrames: 8
    });
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
  }
  update(deltaTime) {
    this.x -= this.game.gameData.gameSpeed;
  }
  draw(ctx, deltaTime) {
    if (!deltaTime) {
      throw new Error("deltaTime not defined");
    }
    if (this.spriteAnimator.drawAnimationDeltaTime(ctx, {
      animationRow: 0,
      deltaTime,
      fps: 15
    })) {
      this.setMarkedForDeletion();
    }
  }
}

class FireExplosion extends Explosion {
  constructor(game, x, y) {
    super(game, x, y);
    const image = SpriteAnimation.loadImage("#fire");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 1,
      staggerFrames: 3,
      numFrames: 8
    });
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
  }
  update(deltaTime) {
    this.x -= this.game.gameData.gameSpeed;
  }
  draw(ctx, deltaTime) {
    if (!deltaTime) {
      throw new Error("deltaTime not defined");
    }
    if (this.spriteAnimator.drawAnimationDeltaTime(ctx, {
      animationRow: 0,
      deltaTime,
      fps: 15
    })) {
      this.setMarkedForDeletion();
    }
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

// src/Particle.ts
class Particle {
  game;
  x;
  y;
  width;
  height;
  size;
  speedX = Math.random() * 6 - 3;
  speedY = Math.random() * 3 - 5;
  sizeModifier = Math.random() * 0.5 + 0.5;
  markedForDeletion = false;
  angle = 0;
  spriteAnimator;
  image = SpriteAnimation.loadImage("#particle");
  frameX = Math.floor(Math.random() * 3);
  frameY = Math.floor(Math.random() * 3);
  bounced = false;
  bottomBounceBoundary = Math.random() * 100 + 60;
  gravity = -0.1;
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.size = this.width * this.sizeModifier;
    this.spriteAnimator = new SpriteAnimation(this, {
      image: this.image,
      numRows: 3
    });
  }
  update() {
    this.angle += 180 / Math.PI * 0.1;
    this.speedY += -this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.y + this.height > this.game.gameData.height - this.bottomBounceBoundary && !this.bounced) {
      this.bounced = true;
      this.speedY *= -0.5;
    }
    if (this.y + this.height > this.game.gameData.height || this.x > this.game.gameData.width) {
      this.markedForDeletion = true;
    }
  }
  isMarkedForDeletion() {
    return this.markedForDeletion;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width * 0.5, this.y + this.height * 0.5);
    ctx.rotate(Math.PI / 180 * this.angle);
    ctx.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, -this.width * 0.5, -this.height * 0.5, this.width, this.height);
    ctx.restore();
  }
}

// src/Projectile.ts
class Projectile {
  game;
  x;
  y;
  width = 36.25;
  height = 20;
  speedX = 3;
  markedForDeletion = false;
  image;
  spriteAnimator;
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.image = SpriteAnimation.loadImage("#fireball");
    this.spriteAnimator = new SpriteAnimation(this, {
      image: this.image,
      numRows: 1,
      numFrames: 4
    });
  }
  update() {
    this.x += this.speedX;
    if (this.x > this.game.gameData.width * 0.8) {
      this.markedForDeletion = true;
    }
  }
  draw(ctx) {
    this.spriteAnimator.drawAnimation(ctx, 0);
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
  hasPowerUp = false;
  maxPowerUpTime = 1e4;
  boundaryDetection() {
    if (this.y > this.game.gameData.height - this.height) {
      this.y = this.game.gameData.height - this.height;
    }
    if (this.y < 0) {
      this.y = 0;
    }
  }
  isPowerUpActive() {
    return this.hasPowerUp;
  }
  powerUp() {
    if (this.hasPowerUp)
      return;
    this.hasPowerUp = true;
    this.game.soundController.play("powerUpSound");
    setTimeout(() => {
      this.hasPowerUp = false;
      this.spriteAnimator.setAnimation(0, 37);
      this.game.gameData.ammo = this.game.gameData.maxAmmo;
      this.game.soundController.play("powerDownSound");
    }, this.maxPowerUpTime);
  }
  update() {
    if (this.game.gameData.keys.has(KEYS.ArrowUp)) {
      this.speedY -= 1;
    } else if (this.game.gameData.keys.has(KEYS.ArrowDown)) {
      this.speedY += 1;
    } else {
      this.speedY = 0;
    }
    this.y += this.speedY;
    this.boundaryDetection();
    if (this.hasPowerUp) {
      this.spriteAnimator.setAnimation(1, 37);
      this.game.gameData.ammo += 0.1;
    }
  }
  draw(ctx) {
    if (this.game.gameData.debugModeOn) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    this.spriteAnimator.drawAnimation(ctx);
  }
  shootTop() {
    if (this.game.gameData.ammo <= 0)
      return;
    this.game.soundController.play("shotSound");
    this.game.gameData.projectiles.push(new Projectile(this.game, this.x + this.width / 3, this.y + 20));
    this.game.gameData.ammo--;
    this.shootBottom();
  }
  shootBottom() {
    if (!this.hasPowerUp)
      return;
    this.game.gameData.projectiles.push(new Projectile(this.game, this.x + this.width / 3, this.y + this.height - 20));
    this.game.gameData.ammo--;
  }
  constructor(game) {
    this.game = game;
    this.image.src = player_default;
    this.spriteAnimator = new SpriteAnimation(this, {
      image: this.image,
      numRows: 2,
      staggerFrames: 1
    });
    this.spriteAnimator.setAnimation(0, 37);
  }
}

// src/Shield.ts
class Shield {
  game;
  width;
  height;
  x;
  y;
  spriteAnimator;
  isPlaying = false;
  constructor(game) {
    this.game = game;
    this.width = this.game.player.width;
    this.height = this.game.player.height;
    this.x = this.game.player.x;
    this.y = this.game.player.y;
    const image = SpriteAnimation.loadImage("#shield");
    this.spriteAnimator = new SpriteAnimation(this, {
      image,
      numRows: 1,
      numFrames: 20,
      staggerFrames: 5
    });
  }
  update() {
    this.x = this.game.player.x;
    this.y = this.game.player.y;
  }
  turnShieldOn() {
    this.isPlaying = true;
  }
  draw(ctx) {
    if (this.isPlaying) {
      if (this.spriteAnimator.drawAnimationOneOff(ctx, 0)) {
        this.isPlaying = false;
      }
    }
  }
}

// src/assets/audio/powerup.wav
var powerup_default = "./powerup-0049748fb31c5443.wav";

// src/assets/audio/powerdown.wav
var powerdown_default = "./powerdown-555addacf6db5377.wav";

// src/assets/audio/hit.wav
var hit_default = "./hit-f2987590348ee706.wav";

// src/assets/audio/explosion.wav
var explosion_default = "./explosion-f00858bec34383ae.wav";

// src/assets/audio/shield.wav
var shield_default = "./shield-d910ea98c95e3da8.wav";

// src/assets/audio/shot.wav
var shot_default = "./shot-2561c16f3eec754f.wav";

// src/SoundController.ts
class SoundController {
  powerUpSound = new Audio(powerup_default);
  powerDownSound = new Audio(powerdown_default);
  hitSound = new Audio(hit_default);
  explosionSound = new Audio(explosion_default);
  shieldSound = new Audio(shield_default);
  shotSound = new Audio(shot_default);
  loadAudio() {
  }
  constructor() {
  }
  play(sound) {
    this[sound].currentTime = 0;
    this[sound].play();
    console.log("sound playing");
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
    if (this.game.player.isPowerUpActive()) {
      ctx.fillStyle = "orange";
    }
    ctx.fillRect(8, 40, this.game.gameData.width * 0.3 * (this.game.gameData.ammo / this.game.gameData.maxAmmo), 40);
  }
  drawGameOver(ctx) {
    if (this.game.gameData.gameOver) {
      let message = "You lost. Better luck next time!";
      if (this.game.gameData.score > this.game.gameData.winningScore) {
        message = "You won!";
      }
      ctx.save();
      ctx.fillStyle = "white";
      ctx.font = this.game.fonts.fontLarge;
      ctx.textAlign = "center";
      ctx.fillText(message, this.game.gameData.width / 2, this.game.gameData.height / 2);
      ctx.restore();
    }
  }
  drawScore(ctx) {
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
  drawGameTimer(ctx) {
    ctx.fillStyle = "white";
    ctx.font = this.game.fonts.fontSmall;
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
  updateExplosions() {
    this.game.gameData.explosions.forEach((explosion2) => explosion2.update());
    this.game.gameData.explosions = this.game.gameData.explosions.filter((explosion2) => !explosion2.getIsMarkedForDeletion());
  }
  updateProjectiles() {
    this.game.gameData.projectiles.forEach((projectile) => {
      projectile.update();
      this.handleProjectilesHittingEnemies(projectile);
    });
  }
  handleProjectilesHittingEnemies(projectile) {
    this.game.gameData.enemies.forEach((enemy) => {
      if (Game2.checkCollision(projectile, enemy)) {
        projectile.delete();
        enemy.decreaseLives();
        if (enemy.isDead()) {
          if (enemy instanceof HiveWhale) {
            for (let i = 0;i < 3; i++) {
              this.game.addEnemy(new Drone(this.game, enemy.x + Math.random() * enemy.width, enemy.y + Math.random() * enemy.height));
            }
          }
          if (enemy instanceof MoonFish) {
            this.game.player.powerUp();
          }
          this.game.createParticles(5, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5);
          this.game.addExplosion(enemy);
        }
        this.game.gameData.score += enemy.getPoints();
      }
    });
  }
  deleteProjectiles() {
    this.game.gameData.projectiles = this.game.gameData.projectiles.filter((projectile) => !projectile.isMarkedForDeletion());
  }
  updateParticles() {
    this.game.gameData.particles.forEach((particle) => particle.update());
    this.game.gameData.particles = this.game.gameData.particles.filter((particle) => !particle.isMarkedForDeletion());
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
  soundController = new SoundController;
  gameData;
  lastTime = 0;
  fonts = {
    fontFamily: "Bangers",
    fontSmall: `20px Bangers`,
    fontMedium: `30px Bangers`,
    fontLarge: `50px Bangers`
  };
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
      debugModeOn: false,
      particles: [],
      explosions: [],
      winningScore: 200,
      shield: new Shield(this)
    };
  }
  resize(width) {
    this.width = width;
    this.gameData.width = width;
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
    this.updater.updateParticles();
    this.updater.handlerAmmoTimer(deltaTime);
    this.updater.updateEnemies();
    this.updater.deleteEnemies();
    this.updater.handleEnemyTimer(deltaTime);
    this.updater.handleGameTimer(deltaTime);
    this.gameData.shield.update();
    this.updater.updateExplosions();
  }
  createParticles(numParticles, x, y) {
    for (let i = 0;i < numParticles; i++) {
      this.gameData.particles.push(new Particle(this, x, y));
    }
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
  draw(deltaTime = 0) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.background.draw(this.ctx);
    this.player.draw(this.ctx);
    this.foreground.draw(this.ctx);
    this.gameData.projectiles.forEach((projectile) => projectile.draw(this.ctx));
    this.gameData.enemies.forEach((enemy) => enemy.draw(this.ctx));
    this.gameData.particles.forEach((particle) => particle.draw(this.ctx));
    this.gameData.shield.draw(this.ctx);
    this.gameData.explosions.forEach((explosion2) => explosion2.draw(this.ctx, deltaTime));
    this.ui.draw(this.ctx);
  }
  addExplosion(enemy) {
    const random = Math.random();
    if (random < 0.5) {
      this.gameData.explosions.push(new SmokeExplosion(this, enemy.x, enemy.y));
    } else {
      this.gameData.explosions.push(new FireExplosion(this, enemy.x, enemy.y));
    }
    this.soundController.play("explosionSound");
  }
  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.update(deltaTime);
    this.draw(deltaTime);
    if (this.gameData.gameOver) {
      return;
    }
    requestAnimationFrame((timestamp2) => this.loop(timestamp2));
  }
  addEnemy(enemy) {
    if (enemy) {
      this.gameData.enemies.push(enemy);
      return;
    }
    const random = Math.random();
    if (random < 0.2)
      this.gameData.enemies.push(new Angler1(this));
    else if (random < 0.3)
      this.gameData.enemies.push(new MoonFish(this));
    else if (random < 0.4)
      this.gameData.enemies.push(new Stalker(this));
    else if (random < 0.5)
      this.gameData.enemies.push(new RazorFin(this));
    else if (random < 0.7)
      this.gameData.enemies.push(new LuckyFish(this));
    else if (random < 0.8)
      this.gameData.enemies.push(new HiveWhale(this));
    else if (random < 0.9)
      this.gameData.enemies.push(new BulbWhale(this));
    else
      this.gameData.enemies.push(new Angler2(this));
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
window.addEventListener("resize", (e) => {
  canvas.width = window.innerWidth;
  game.resize(window.innerWidth);
});
console.log(canvas.width, canvas.height);
var game = new Game2(canvas.width, canvas.height, ctx);
game.gameLoop();
