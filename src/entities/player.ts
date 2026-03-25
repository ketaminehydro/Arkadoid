import type { World } from '../ecs/world.js';

import { Position, createPosition, Velocity, createVelocity, Sprite, createSprite } from '../components';

interface PlayerConfig {
  x: number;
  y: number;
  image: HTMLImageElement;
}

export function createPlayer(world: World, { x, y, image }: PlayerConfig): number {
  const playerId = world.createEntity();

  world.addComponent(playerId, Position, createPosition(x, y));
  world.addComponent(playerId, Velocity, createVelocity(0, 0));
  world.addComponent(playerId, Sprite, createSprite(image, 64, 64));

  return playerId;
}
