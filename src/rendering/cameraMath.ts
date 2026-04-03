export const BASE_PIXELS_PER_METER = 32;

import type { CameraComponentOld } from '../components/cameraOld';

export function getPixelsPerMeter(camera: CameraComponentOld): number {
  return BASE_PIXELS_PER_METER * camera.zoom;
}