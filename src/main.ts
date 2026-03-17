import { setupInput } from './core/input.js';
import { createGameLoop } from './core/gameLoop.js';
import { loadLevel1 } from './scenes/level1.js';

async function bootstrap(): Promise<void> {
  const canvas = document.getElementById('game');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Game canvas is not available.');
  }

  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL context is not available.');
  }

  setupInput();
  const world = await loadLevel1(canvas, gl);

  const loop = createGameLoop((deltaTime: number) => {
    world.runSystems(deltaTime);
  });

  loop.start();
}

bootstrap();
