import { createGameLoop } from './core/gameLoop.js';
import { setupInput } from './core/input.js';
import { loadLevel1 } from './scenes/level1.js';
import { createRenderSystem } from './systems/renderSystem.js';

async function bootstrap(): Promise<void> {
  const canvas = document.getElementById('game');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Game canvas is not available.');
  }

  setupInput();

  const level = await loadLevel1();
  const { world } = level;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  world.addSystem(createRenderSystem());

  const loop = createGameLoop((deltaTime: number) => {
    world.runSystems(deltaTime);
  });

  loop.start();
}

bootstrap();
