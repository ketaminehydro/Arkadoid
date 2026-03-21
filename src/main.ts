import { setupInput } from './core/input.js';
import { createGameLoop } from './core/gameLoop.js';
import { loadLevel1 } from './scenes/level1.js';
import { setupDebug } from './utils/debug.js';

/* The main entry point for the game */
async function bootstrap(): Promise<void> {

  // Canvas and WebGL context setup
  const canvas = document.getElementById('game');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Game canvas is not available.');
  }

  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL context is not available.');
  }

  // Input handler setup
  setupInput();

  // Load the first level and initialize the game world
  const world = await loadLevel1(canvas, gl);

  // Setup debug access to the world and entities
/*  const entities = {
    player: playerId,
    followCamera: followCameraId,
    overviewCamera: overviewCameraId
  };

  // Expose debug helpers
  setupDebug(world, entities);*/
  
  // Start the game loop, loop is of type GameLoop
  const loop = createGameLoop((deltaTime: number) => {
    world.runSystems(deltaTime);
  });

  loop.start();
}

bootstrap();
