import { World } from '../ecs/world.js';

import { createPlayer } from '../entities/player.js';

import { Body, createBody, 
  Position, createPosition, 
  Velocity, createVelocity, 
  Sprite, createSprite, 
  Camera, createCamera 
} from '../components';

import { playerControlSystem } from '../systems/playerControlSystem.js';
import { movementSystem } from '../systems/movementSystem.js';
import { collisionSystem } from '../systems/collisionSystem.js';
import { overviewCameraSystem } from '../systems/overviewCameraSystem.js';
import { followCameraSystem } from '../systems/followCameraSystem.js';

/* helper functions */
function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export interface Level1{
  world: World;
  playerId: number;
  followCameraId: number;
  overviewCameraId: number;
  worldSize: { width: number; height: number };
}

// World size for this level
const WORLD_WIDTH_METERS = 100;
const WORLD_HEIGHT_METERS = 100;


// Asteroid placer function
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

// Level construction: what entities, how many and where
export async function loadLevel1(): Promise<Level1> {

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

  // Cameras 
  const followCameraId = world.createEntity();
  world.addComponent(followCameraId, Camera, createCamera({x: 50, y: 50}, 2, "follow", playerId));

  const overviewCameraId = world.createEntity();
  world.addComponent(overviewCameraId, Camera, createCamera({x: 50, y: 50}, 0.15, "overview"));

  // Systems
  world.addSystem(playerControlSystem);
  world.addSystem(collisionSystem);
  world.addSystem(movementSystem);
  world.addSystem(followCameraSystem);
  world.addSystem(overviewCameraSystem);

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


//TODO: move elsewhere
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}
