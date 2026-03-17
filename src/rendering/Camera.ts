export const BASE_PIXELS_PER_METER = 32;

export interface CameraView {
  position: { x: number; y: number }; // meters
  zoom: number;
  viewWidth: number; // meters
  viewHeight: number; // meters
}

export function getPixelsPerMeter(camera: CameraView): number {
  return BASE_PIXELS_PER_METER * camera.zoom;
}
