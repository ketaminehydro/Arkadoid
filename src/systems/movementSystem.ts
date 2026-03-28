import { Position, Velocity } from '../components';
import type { System } from '../ecs/system';
import type { World } from '../ecs/world';

interface MovementSystemConfig {
  world: World;
}

export function createMovementSystem(config: MovementSystemConfig): System {
  const movingEntities = config.world.createQuery(Position, Velocity);

  return {
    name: 'movementSystem',
    priority: 20,
    update(world: World, deltaTime: number): void {
      for (const entityId of movingEntities.entities) {
        const position = world.getComponent(entityId, Position)!;
        const velocity = world.getComponent(entityId, Velocity)!;

        position.x += velocity.vx * deltaTime;
        position.y += velocity.vy * deltaTime;
      }
    }
  };
}
