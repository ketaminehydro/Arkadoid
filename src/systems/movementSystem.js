import { Position, Velocity } from '../utils/componentTypes.js';

export function movementSystem(world, deltaTime) {
  for (const entityId of world.getEntitiesWith(Position, Velocity)) {
    const position = world.getComponent(entityId, Position);
    const velocity = world.getComponent(entityId, Velocity);

    position.x += velocity.vx * deltaTime;
    position.y += velocity.vy * deltaTime;
  }
}
