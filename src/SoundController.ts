import powerup from "./assets/audio/powerup.wav";
import powerdown from "./assets/audio/powerdown.wav";
import hit from "./assets/audio/hit.wav";
import explosion from "./assets/audio/explosion.wav";
import shield from "./assets/audio/shield.wav";
import shot from "./assets/audio/shot.wav";

export default class SoundController {
  public powerUpSound = new Audio(powerup);
  public powerDownSound = new Audio(powerdown);
  public hitSound = new Audio(hit);
  public explosionSound = new Audio(explosion);
  public shieldSound = new Audio(shield);
  public shotSound = new Audio(shot);

  loadAudio() {}
  constructor() {
    // this.powerUpSound.preload = "auto";
    // this.powerDownSound.preload = "auto";
    // this.hitSound.preload = "auto";
    // this.explosionSound.preload = "auto";
    // this.shieldSound.preload = "auto";
    // this.shotSound.preload = "auto";
  }

  play(sound: AudioKeys) {
    // always reset the sound to the beginning before playing

    this[sound].currentTime = 0;
    this[sound].play();
    console.log("sound playing");
  }
}

// type Sounds<T extends keyof SoundController> =
//   SoundController[T] extends HTMLAudioElement ? SoundController[T] : never;

// const bruh: Sounds<"explosionSound"> = new Audio();

// create a type that is only the keys of the soundcontroller class that are audio types
type AudioKeys<T = SoundController> = {
  [K in keyof T]: T[K] extends HTMLAudioElement ? K : never;
}[keyof T];
