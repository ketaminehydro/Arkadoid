import type { World } from '../ecs/world.js';
import { Position, Velocity } from '../components';
import type { System } from '../ecs/system';

export function movementSystem(world: World, deltaTime: number): void {
  for (const entityId of world.getEntitiesWith(Position, Velocity)) {
    const position = world.getComponent(entityId, Position);
    const velocity = world.getComponent(entityId, Velocity);

    if (!position || !velocity) {
      continue;
    }

    position.x += velocity.vx * deltaTime;
    position.y += velocity.vy * deltaTime;
  }
}