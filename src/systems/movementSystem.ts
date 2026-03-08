import type { World } from '../ecs/world.js';
import { Position, Velocity } from '../utils/componentTypes.js';
import type { PositionComponent, VelocityComponent } from '../utils/componentTypes.js';

export function movementSystem(world: World, deltaTime: number): void {
  for (const entityId of world.getEntitiesWith(Position, Velocity)) {
    const position = world.getComponent<PositionComponent>(entityId, Position);
    const velocity = world.getComponent<VelocityComponent>(entityId, Velocity);

    if (!position || !velocity) {
      continue;
    }

    position.x += velocity.vx * deltaTime;
    position.y += velocity.vy * deltaTime;
  }
}
