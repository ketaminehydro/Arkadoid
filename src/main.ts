import { createGameLoop } from './core/gameLoop.js';
import { setupInput } from './core/input.js';
import { createRenderer, VIRTUAL_RESOLUTION } from './rendering/renderer.js';
import { loadLevel1 } from './scenes/level1.js';
import { createRenderSystem } from './systems/renderSystem.js';

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

  const level = await loadLevel1();
  const { world, followCameraId, overviewCameraId, worldSize } = level;

  const renderer = createRenderer(gl, canvas, {
    worldBounds: worldSize,
    viewports: [
      {
        x: 0,
        y: 0,
        width: VIRTUAL_RESOLUTION.width / 2,
        height: VIRTUAL_RESOLUTION.height,
        cameraId: followCameraId
      },
      {
        x: VIRTUAL_RESOLUTION.width / 2,
        y: 0,
        width: VIRTUAL_RESOLUTION.width / 2,
        height: VIRTUAL_RESOLUTION.height,
        cameraId: overviewCameraId
      }
    ]
  });

  window.addEventListener('resize', renderer.resizeToWindow);

  world.addSystem(createRenderSystem({ renderer }));

  const loop = createGameLoop((deltaTime: number) => {
    world.runSystems(deltaTime);
  });

  loop.start();
}

bootstrap();
