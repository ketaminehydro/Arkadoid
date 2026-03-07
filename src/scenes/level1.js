import { World } from '../ecs/world.js';
import { createPlayer } from '../entityFactories/player.js';
import { playerControlSystem } from '../systems/playerControlSystem.js';
import { movementSystem } from '../systems/movementSystem.js';
import { collisionSystem } from '../systems/collisionSystem.js';
import { createRenderSystem } from '../systems/renderSystem.js';
import { createWebGLRenderer } from '../core/webglRenderer.js';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function loadLevel1(canvas, gl) {
  const world = new World();
  const renderer = createWebGLRenderer(gl, canvas);
  const playerImage = await loadImage('./assets/player.png');

  createPlayer(world, {
    x: (canvas.width - 64) * 0.5,
    y: (canvas.height - 64) * 0.5,
    image: playerImage
  });

  // Loop order from README: input, collisions, update entities, draw.
  world.addSystem(playerControlSystem);
  world.addSystem(collisionSystem);
  world.addSystem(movementSystem);
  world.addSystem(createRenderSystem(renderer));

  return world;
}
