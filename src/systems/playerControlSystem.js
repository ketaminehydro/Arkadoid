import { getAxisX, getAxisY } from '../core/input.js';
import { Velocity } from '../utils/componentTypes.js';

const PLAYER_SPEED = 220;

export function playerControlSystem(world) {
  for (const entityId of world.getEntitiesWith(Velocity)) {
    const velocity = world.getComponent(entityId, Velocity);
    velocity.vx = getAxisX() * PLAYER_SPEED;
    velocity.vy = getAxisY() * PLAYER_SPEED;
  }
}
