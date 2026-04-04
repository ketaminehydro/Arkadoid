import { createGameLoop } from './core/gameLoop.js';
import { setupInput } from './core/input.js';
import { loadLevel1 } from './scenes/level1.js';
import { createRenderSystem } from './systems/renderSystem.js';

async function bootstrap(): Promise<void> {
  
  // Set up the canvas
  const canvas = document.getElementById('game');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Game canvas is not available.');
  }

  // Set up Input handler
  setupInput();

  // Set up level
  const level = await loadLevel1();
  const { world } = level;

  // Watch for window resizes
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // Set up systems
  world.addSystem(createRenderSystem());

  // Set up gameloop
  const loop = createGameLoop((deltaTime: number) => {
    world.runSystems(deltaTime);
  });

  // Start the loop
  loop.start();
}

bootstrap();
