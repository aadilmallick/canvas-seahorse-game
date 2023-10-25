import Game from "./Game";
import { KEYS } from "./types";

export default class InputHandler {
  constructor(private game: Game) {
    window.addEventListener("keydown", (e) => {
      // up or down arrow, move player
      if (e.key === KEYS.ArrowUp || e.key === KEYS.ArrowDown) {
        this.game.gameData.keys.add(e.key);
      }
      // space bar, shoot projectile
      if (e.key === KEYS.Space) {
        this.game.getPlayer().shootTop();
      }
    });
    window.addEventListener("keyup", (e) => {
      this.game.gameData.keys.delete(e.key as KEYS);
    });
  }
}
