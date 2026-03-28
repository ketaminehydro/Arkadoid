import { Position, Sprite, Velocity, createPosition, createSprite, createVelocity } from '../components';
import type { EntityId } from '../ecs/entity.js';
import type { World } from '../ecs/world.js';

interface PlayerConfig {
  x: number;
  y: number;
  image: HTMLImageElement;
}

export function createPlayer(world: World, { x, y, image }: PlayerConfig): EntityId {
  const playerId = world.createEntity();

  world.addComponent(playerId, Position, createPosition(x, y));
  world.addComponent(playerId, Velocity, createVelocity(0, 0));
  world.addComponent(playerId, Sprite, createSprite(image, 64, 64));

  return playerId;
}
