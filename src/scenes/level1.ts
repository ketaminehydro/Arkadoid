import { createEntity } from '../ecs/entity.js';
import { World } from '../ecs/world.js';
import { createPlayer } from '../entityFactories/player.js';
import { createBody } from '../components/body.js';
import { createCamera } from '../components/camera.js';
import { createPosition } from '../components/position.js';
import { playerControlSystem } from '../systems/playerControlSystem.js';
import { movementSystem } from '../systems/movementSystem.js';
import { collisionSystem } from '../systems/collisionSystem.js';
import { createRenderSystem } from '../systems/renderSystem.js';
import { createRenderer, VIRTUAL_RESOLUTION } from '../rendering/Renderer.js';
import { Body, Camera, Position } from '../utils/componentTypes.js';

const WORLD_WIDTH_METERS = 100;
const WORLD_HEIGHT_METERS = 100;

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}


//TODO: move to entityFactories
function createAsteroids(world: World, count: number): void {
  for (let index = 0; index < count; index += 1) {
    const asteroidId = createEntity(world);
    world.addComponent(
      asteroidId,
      Position,
      createPosition(randomRange(6, WORLD_WIDTH_METERS - 6), randomRange(6, WORLD_HEIGHT_METERS - 6))
    );
    world.addComponent(
      asteroidId,
      Body,
      createBody(randomRange(1.2, 2.8), randomRange(1.2, 2.8), '#778da9')
    );
  }
}

// Level construction: what entities, how many and where
export async function loadLevel1(
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext
): Promise<World> {

  // World
  const world = new World();

  // Player
  const playerId = createPlayer(world, {
    x: 50,
    y: 50,
    image: await loadImage('./assets/player.png')
  });
  world.addComponent(playerId, Body, createBody(2, 2, '#f4d35e'));

  // Asteroids
  createAsteroids(world, 14);

  // Cameras //TODO: move this elsewhere
  const followCameraId = createEntity(world);
  world.addComponent(followCameraId, Camera, createCamera(50, 50, 2, 15, 8.4375));

  const overviewCameraId = createEntity(world);
  world.addComponent(overviewCameraId, Camera, createCamera(50, 50, 0.15, 100, 100));

  // Renderer
  const renderer = createRenderer(gl, canvas, {
    worldBounds: {
      width: WORLD_WIDTH_METERS,
      height: WORLD_HEIGHT_METERS
    },
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

  world.addSystem(playerControlSystem);
  world.addSystem(collisionSystem);
  world.addSystem(movementSystem);
  world.addSystem(
    createRenderSystem({
      renderer,
      playerId,
      followCameraId,
      overviewCameraId,
      worldSize: { width: WORLD_WIDTH_METERS, height: WORLD_HEIGHT_METERS }
    })
  );

  return world;
}


//TODO: move elsewhere
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}
