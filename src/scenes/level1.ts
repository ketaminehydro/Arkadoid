import {
  Body,
  Camera,
  Position,
  createBody,
  createCamera,
  createPosition
} from '../components';
import type { EntityId } from '../ecs/entity.js';
import { World } from '../ecs/world.js';
import { createPlayer } from '../entities/player.js';
import { createCollisionSystem } from '../systems/collisionSystem.js';
import { createFollowCameraSystem } from '../systems/followCameraSystem.js';
import { createMovementSystem } from '../systems/movementSystem.js';
import { createOverviewCameraSystem } from '../systems/overviewCameraSystem.js';
import { createPlayerControlSystem } from '../systems/playerControlSystem.js';

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export interface Level1 {
  world: World;
  playerId: EntityId;
  followCameraId: EntityId;
  overviewCameraId: EntityId;
  worldSize: { width: number; height: number };
}

const WORLD_WIDTH_METERS = 100;
const WORLD_HEIGHT_METERS = 100;

function createAsteroids(world: World, count: number): void {
  for (let index = 0; index < count; index += 1) {
    const asteroidId = world.createEntity();

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

export async function loadLevel1(): Promise<Level1> {
  const world = new World();

  const playerId = createPlayer(world, {
    x: 50,
    y: 50,
    image: await loadImage('./assets/player.png')
  });

  world.addComponent(playerId, Body, createBody(2, 2, '#f4d35e'));


  createAsteroids(world, 14);

  const followCameraId = world.createEntity();
  world.addComponent(followCameraId, Camera, createCamera({ x: 50, y: 50 }, 2, 'follow', playerId));

  const overviewCameraId = world.createEntity();
  world.addComponent(overviewCameraId, Camera, createCamera({ x: 50, y: 50 }, 0.15, 'overview'));

  world.addSystem(createPlayerControlSystem({ world }));
  world.addSystem(createCollisionSystem({ world }));
  world.addSystem(createMovementSystem({ world }));
  world.addSystem(createFollowCameraSystem({ world }));
  world.addSystem(
    createOverviewCameraSystem({
      world,
      worldWidth: WORLD_WIDTH_METERS,
      worldHeight: WORLD_HEIGHT_METERS
    })
  );

  return {
    world,
    playerId,
    followCameraId,
    overviewCameraId,
    worldSize: {
      width: WORLD_WIDTH_METERS,
      height: WORLD_HEIGHT_METERS
    }
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}
