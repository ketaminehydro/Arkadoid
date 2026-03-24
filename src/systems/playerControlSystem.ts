import type { World } from '../ecs/world.js';
import { getAxisX, getAxisY } from '../core/input.js';
import { Velocity } from '../components';
import type { System } from '../ecs/system';

const PLAYER_SPEED = 8; // meters per second

export const playerControlSystem : System = {
  name : "playerControlSystem",
  priority : 10,
  update : (world: World, deltaTime: number) => {
    for (const entityId of world.getEntitiesWith(Velocity)) {
      const velocity = world.getComponent(entityId, Velocity);
      if (!velocity) {
        continue;
      }

      velocity.vx = getAxisX() * PLAYER_SPEED;
      velocity.vy = getAxisY() * PLAYER_SPEED;
    }
  }
}