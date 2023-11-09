import { Drone, HiveWhale, MoonFish } from "../Enemy";
import Game from "../Game";
import Particle from "../Particle";
import Projectile from "../Projectile";

export default class Updater {
  constructor(private game: Game) {}

  // update and filter explosions
  public updateExplosions() {
    this.game.gameData.explosions.forEach((explosion) => explosion.update());
    this.game.gameData.explosions = this.game.gameData.explosions.filter(
      (explosion) => !explosion.getIsMarkedForDeletion()
    );
  }

  public updateProjectiles() {
    // update each projectile
    this.game.gameData.projectiles.forEach((projectile) => {
      projectile.update();
      // check if projectiles hit any enemy.
      // Three projectiles have to collide with enemy before enemy gets deleted
      this.handleProjectilesHittingEnemies(projectile);
    });
  }

  private handleProjectilesHittingEnemies(projectile: Projectile) {
    this.game.gameData.enemies.forEach((enemy) => {
      // Delete projectile as soon as it collides with enemy
      if (Game.checkCollision(projectile, enemy)) {
        projectile.delete();
        enemy.decreaseLives();
        // if destroyed enemy
        if (enemy.isDead()) {
          // if enemy is hivewhale, spawn 3 new enemies
          if (enemy instanceof HiveWhale) {
            for (let i = 0; i < 3; i++) {
              this.game.addEnemy(
                new Drone(
                  this.game,
                  enemy.x + Math.random() * enemy.width,
                  enemy.y + Math.random() * enemy.height
                )
              );
            }
          }
          // if enemy is moonfish, power up player
          if (enemy instanceof MoonFish) {
            this.game.player.powerUp();
          }
          // drop particles
          this.game.createParticles(
            5,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          );
          this.game.addExplosion(enemy);
        }

        // add score
        this.game.gameData.score += enemy.getPoints();
      }
    });
  }

  public deleteProjectiles() {
    // delete projectiles that should be deleted
    this.game.gameData.projectiles = this.game.gameData.projectiles.filter(
      (projectile) => !projectile.isMarkedForDeletion()
    );
  }

  public updateParticles() {
    this.game.gameData.particles.forEach((particle) => particle.update());

    this.game.gameData.particles = this.game.gameData.particles.filter(
      (particle) => !particle.isMarkedForDeletion()
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
