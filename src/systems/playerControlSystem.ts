import type { World } from '../ecs/world.js';
import { getAxisX, getAxisY } from '../core/input.js';
import { Velocity } from '../utils/componentTypes.js';
import type { VelocityComponent } from '../utils/componentTypes.js';

const PLAYER_SPEED = 220;

export function playerControlSystem(world: World): void {
  for (const entityId of world.getEntitiesWith(Velocity)) {
    const velocity = world.getComponent<VelocityComponent>(entityId, Velocity);
    if (!velocity) {
      continue;
    }

    velocity.vx = getAxisX() * PLAYER_SPEED;
    velocity.vy = getAxisY() * PLAYER_SPEED;
  }
}
