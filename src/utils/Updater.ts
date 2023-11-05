import Game from "../Game";

export default class Updater {
  constructor(private game: Game) {}

  public updateProjectiles() {
    // update each projectile
    this.game.gameData.projectiles.forEach((projectile) => {
      projectile.update();
      // check if projectiles hit any enemy.
      // Three projectiles have to collide with enemy before enemy gets deleted
      this.game.gameData.enemies.forEach((enemy) => {
        // Delete projectile as soon as it collides with enemy
        if (Game.checkCollision(projectile, enemy)) {
          projectile.delete();
          enemy.decreaseLives();
          this.game.gameData.score += enemy.getPoints();
        }
      });
    });
  }

  public deleteProjectiles() {
    // delete projectiles that should be deleted
    this.game.gameData.projectiles = this.game.gameData.projectiles.filter(
      (projectile) => !projectile.isMarkedForDeletion()
    );
  }

  public handlerAmmoTimer(deltaTime: number) {
    this.game.gameData.ammoTimer = this.game.timeDeltaHandler({
      deltaTime,
      timer: this.game.gameData.ammoTimer,
      maxTime: this.game.gameData.maxAmmoLoadTime,
      callback: () => {
        if (this.game.gameData.ammo < this.game.gameData.maxAmmo) {
          this.game.gameData.ammo++;
        }
      },
    });
  }

  public updateEnemies() {
    this.game.gameData.enemies.forEach((enemy) => enemy.update());
  }

  public deleteEnemies() {
    this.game.gameData.enemies = this.game.gameData.enemies.filter(
      (enemy) => !enemy.isMarkedForDeletion()
    );
  }

  public handleEnemyTimer(deltaTime: number) {
    this.game.gameData.enemyTimer = this.game.timeDeltaHandler({
      deltaTime,
      timer: this.game.gameData.enemyTimer,
      maxTime: this.game.gameData.maxEnemyTimer,
      callback: () => {
        this.game.addEnemy();
      },
    });
  }

  public handleGameTimer(deltaTime: number) {
    this.game.gameData.gameTimer = this.game.timeDeltaHandler({
      deltaTime,
      timer: this.game.gameData.gameTimer,
      maxTime: this.game.gameData.gameTimeLimit,
      callback: () => {
        this.game.gameData.gameOver = true;
      },
    });
  }
}
