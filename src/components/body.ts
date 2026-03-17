import type { BodyComponent } from '../utils/componentTypes.js';

export function createBody(width: number, height: number, color: string): BodyComponent {
  return { width, height, color };
}
