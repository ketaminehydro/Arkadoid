import type { World } from '../ecs/world.js';
import { Position, Velocity } from '../components';
import type { System } from '../ecs/system';

export const movementSystem : System = {
  name: "movementSystem",
  priority: 20,
  update : (world: World, deltaTime: number) => {
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
}