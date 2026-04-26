export const BASE_PIXELS_PER_METER = 32;

import type { CameraComponent } from '../components/camera';

export function getPixelsPerMeter(camera: CameraComponent): number {
  return BASE_PIXELS_PER_METER * camera.zoom;
}