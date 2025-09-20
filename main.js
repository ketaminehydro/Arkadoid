import { initGL, loadTexture } from "./render/glRenderer.js";
import { Position } from "./components/position.js";
import { Sprite } from "./components/sprite.js";
import { renderSystem } from "./systems/renderSystem.js";

// Canvas setup
const canvas = document.getElementById("game");
canvas.width = 800;
canvas.height = 600;

// Initialize WebGL
initGL(canvas);

// Entity Component System
const ecs = {
  entities: new Map(),
  idCounter: 0,
  add(id, Comp, value) {
    if (!this.entities.has(id)) this.entities.set(id, new Map());
    this.entities.get(id).set(Comp, value);
  },
  get(id, Comp) {
    return this.entities.get(id)?.get(Comp);
  },
  with(...comps) {
    const result = [];
    for (const [id, map] of this.entities.entries()) {
      if (comps.every(c => map.has(c))) result.push(id);
    }
    return result;
  }
};

// Load image & start loop
const image = new Image();
image.src = "assets/player.png";
image.onload = () => {
  const tex = loadTexture(image);
  const id = ecs.idCounter++;

  ecs.add(id, Position, new Position(100, 100));
  ecs.add(id, Sprite, new Sprite(tex, 64, 64));

  function loop() {
    renderSystem(ecs, canvas);
    requestAnimationFrame(loop);
  }

  loop();
};