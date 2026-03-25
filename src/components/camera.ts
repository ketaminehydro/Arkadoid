/* TYPE */
import { ComponentType } from '../ecs/component';
export interface CameraComponent {
  x: number; // meters
  y: number; // meters
  zoom: number; // factor
  viewWidth: number; // meters
  viewHeight: number; // meters
}

/* SYMBOL */
export const Camera: ComponentType<CameraComponent> = 
  Symbol('Camera') as ComponentType<CameraComponent>;

/* FACTORY */
export function createCamera(
  x: number,
  y: number,
  zoom: number,
  viewWidth: number,
  viewHeight: number
): CameraComponent {
  return {
    x, 
    y,
    zoom,
    viewWidth,
    viewHeight
  };
}