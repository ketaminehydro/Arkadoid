import type { PositionComponent } from '../utils/componentTypes.js';

export function createPosition(x = 0, y = 0): PositionComponent {
  return { x, y };
}
