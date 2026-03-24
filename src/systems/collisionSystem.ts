import type { World } from '../ecs/world.js';
import type { System } from '../ecs/system';

export const collisionSystem : System = {
  name: "collisionSystem",
  priority: 30,
  update : (_world: World, _deltaTime: number) => {
    // Placeholder collision logic for future implementation.
  }
}