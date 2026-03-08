import { createEntity } from '../ecs/entity.js';
import type { World } from '../ecs/world.js';
import { createPosition } from '../components/position.js';
import { createVelocity } from '../components/velocity.js';
import { createSprite } from '../components/sprite.js';
import { Position, Velocity, Sprite } from '../utils/componentTypes.js';

interface PlayerConfig {
  x: number;
  y: number;
  image: HTMLImageElement;
}

export function createPlayer(world: World, { x, y, image }: PlayerConfig): number {
  const playerId = createEntity(world);

  world.addComponent(playerId, Position, createPosition(x, y));
  world.addComponent(playerId, Velocity, createVelocity(0, 0));
  world.addComponent(playerId, Sprite, createSprite(image, 64, 64));

  return playerId;
}
