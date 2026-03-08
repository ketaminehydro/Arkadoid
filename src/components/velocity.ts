import type { VelocityComponent } from '../utils/componentTypes.js';

export function createVelocity(vx = 0, vy = 0): VelocityComponent {
  return { vx, vy };
}
