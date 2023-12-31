# What I learned

## Positioning the canvas

The first step is to make sure the canvas is absolutely positioned, and then center it in the viewport using these 3 CSS rules:

- `top: 50%` : centers vertically
- `left: 50%` : centers horizontally
- `transform: translate(-50%, -50%)` : centers the canvas in the viewport

Then set a max-width percentage on the canvas so it doesn't extend past the viewport.

```css
canvas {
  position: absolute;
  /* centers it */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 5px solid black;
  max-width: 95%;
}
```

The second step is to manually access the canvas element in the javascript and then change the width and height in the javascript.

```javascript
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = 1500;
canvas.height = 800;
const ctx = canvas.getContext("2d")!;
```

## OOP

We will use classes to represent our game. Below is the basic gist of how this works:

> The `Game` class represents the entire game data and instantiates all other classes. It updates the canvas each frame and draws to the canvas each frame. We pass an instance of the `Game` object into all other classes so that they can access game data.

Classes that need to draw to the canvas will have two methods that are called each frame:

- `update()` : updates the game data, like coordinates to draw to
- `draw()` : draws to the canvas using the canvas context

The `Game` class as a shell looks like this:

```typescript
class Game {
  constructor() {
    // instantiate other classes
  }

  private update() {
    // update game data by calling other classes' update methods
  }

  private draw(ctx: CanvasRenderingContext2D) {
    // clear canvas before each frame
    ctx.clearRect(0, 0, this.width, this.height);

    // draw to canvas by calling other classes' draw methods
  }

  public gameLoop() {
    this.draw();
    this.update();
    requestAnimationFrame(() => this.gameLoop());
  }
}
```

In the `update()` method, you do stuff like changing the internal class properties of object instances, so stuff like their coordinates, their velocities, etc.

In the `draw()` method, you use the canvas context to draw to the canvas. You clear the canvas before drawing each frame so that you get this illusion of animation.

### Game design

The `Game` class will have all other classes instantiated on it as private fields, like the `Player`, `UI`, and others.

The game class will also have an internal game data store that all other classes can use.

## Game loop and delta time

Delta time is the amount of milliseconds each frame lasts on a user's machine. Since different machines run at different fps speeds, delta time allows us to have the same speed animation despite the difference in performance between a 60 fps laptop and a 120 fps laptop.

We can use delta time to make sure that the game runs at the same speed on both machines.

The `requestAnimationFrame()` function actually takes in a callback, with an optional passed parameter of the timestamp of when the last frame began. We can use this to find the elapsed time between each frame.

You can pass back this timestamp in a recursive way like so:

```javascript
requestAnimationFrame((ts) => loop(ts)));
```

This is how you can calculate delta time:

```typescript
// time tracker
let lastTime = 0;

function loop(timestamp: number = 0) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // do stuff with deltaTime

  requestAnimationFrame((ts) => loop(ts)));
}

requestAnimationFrame(loop);
```

### Game loop method

Once we have access to delta time, we can pass it into the `update()` method to allow time-based operations like loading ammo based on an interval.

```typescript
class Game {
  private loop(timestamp: number) {
    // delta time calculations
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // do stuff during frame, pass deltaTime into update()
    this.update(deltaTime);
    this.draw();

    // request next frame and pass timestamp
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  // starts game animation loop
  public gameLoop() {
    this.lastTime = 0;
    this.loop(0);
  }
}
```

### Doing things that require an interval

Say we want to let user load ammo once every 500 milliseconds. How do we achieve that while taking into account delta time?

We could do something where we store a timer, increment it by the elapsed time (delta time), and execute a callback only once the timer's time reaches past a certain limit we set. We then set the timer back to 0 and thus create an interval.

```typescript
//   wait until ammoTimer gets past 1/2 second load time, then add a single ammo
//   works like a debounce. Only add ammo once every 500ms
update(deltaTime: number) {

    // only execute callback if timer gets past certain limit, here it's 500ms
    if (this.gameData.ammoTimer > this.gameData.maxAmmoLoadTime) {
      // callback code
      if (this.gameData.ammo < this.gameData.maxAmmo) {
        this.gameData.ammo++;
      }

      // reset timer back to 0
      this.gameData.ammoTimer = 0;
    } else {
      this.gameData.ammoTimer += deltaTime;
    }
}
```

We have two state variables: a timer to keep track of time, and a max time that when surpassed, do an action.

Here are the basic steps:

1. Increment the timer by delta time
2. Check if timer is past max time interval limit.
   - If so, execute callback and reset timer back to 0

We can extract this into a more reusable form:

```typescript
function timeDeltaHandler({
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
```

Then make sure to set the game timer state to the return value from this function.

## Input handling

We will have an `InputHandler` class that will handle all keyboard events and similar DOM events in our game, and change game data accordingly.

```ts
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
```

## Projectiles

## Checking for collision

## Parallax background

## sprite animation

### Standard sprite animation

### Delta time animation

## Debug mode

## Adding fonts

## Particles

### Particle rotation

## Explosions

## Type Declaration Files

Type declaration files allow you to have essentially global custom typings for your project without having to constantly import interfaces and other custom things.

Type declarations files, also known as `.d.ts` files, are **ambient typing** files, meaning that those types have to be purely explanatory and not actually executable code or values like enums are, but more on that later.

Here are the basic steps:

1. Create a `typings` folder in your project root
2. Create a `typings/types.d.ts` file. This will all your ambient typings will live.
3. Add the `typings` folder as the source for your project's ambient type declarations using the `compilerOptions.typeRoots` property in your `tsconfig.json` file.

```json
{
  "compilerOptions": {
    "typeRoots": ["./typings"]
  }
}
```

### Allowing image imports

All you have to do to let typescript know how to handle importing images and the like is by declaring them as a module inside the type declaration file:

```ts
declare module "*.png";
```

### Extending window object

You can add properties to the global window or global object, making them globally available. You can do this if you want to add custom methods and types to the global namespace:

```ts
declare interface Window {
  // gets the ElectronAPI interface object from another file, and uses the typing here
  electronAPI: import("./preload").ElectronAPI;
}
```

By declaring the `Window` interface, you can add properties onto the existing window global object, which can be useful.

### Ambient enums

Enums by default cannot be used in type declaration files because they are **non-ambient**. During the javascript runtime, they compile to actual objects. They are not just types.

To fix this, we can do a bit of hacking to get a nonambient and a ambient version of the same enum by attaching it to the global window namespace:

These are the steps we follow in the `types.d.ts` file:

1. Declare the enum using the `declare enum` keyword. This creates a non-ambient enum, but we also need an enum that resolves to a value.
2. Attach the enum to global window object, which makes the enum an actual value

```javascript
// 1. declare the enum
declare enum KEYSENUM {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  Space = " ",
}

// 2. attach it to the global window object
declare var KEYS: typeof KEYSENUM;
window.KEYS = KEYSENUM;
```

Then in our entry point, we have to follow these steps to add the enum to the window object during the javascript runtime:

```typescript
// index.ts

// 1. redefine the enum
enum KEYSENUM {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  Space = " ",
}

// 2. attach it to the global window object
window.KEYS = KEYSENUM;
```

We now have two different versions of the enum: an ambient and non-ambient one. `KEYSENUM` is the one we can use as a type while `KEYS` is the one we can use as an object.
