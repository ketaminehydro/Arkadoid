import type { System } from '../ecs/system';
import type { World } from '../ecs/world';

interface CollisionSystemConfig {
  world: World;
}

export function createCollisionSystem(_config: CollisionSystemConfig): System {
  return {
    name: 'collisionSystem',
    priority: 30,
    update(_world: World, _deltaTime: number): void {
      // Placeholder collision logic for future implementation.
    }
  };
}
