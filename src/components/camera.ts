import type { CameraComponent } from '../utils/componentTypes.js';

export function createCamera(
  x: number,
  y: number,
  zoom: number,
  viewWidth: number,
  viewHeight: number
): CameraComponent {
  return {
    position: { x, y },
    zoom,
    viewWidth,
    viewHeight
  };
}
