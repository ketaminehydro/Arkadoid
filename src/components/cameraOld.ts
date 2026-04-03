/* TYPE */
import { ComponentType } from '../ecs/component';
import { EntityId } from '../ecs/entity';

export interface CameraComponentOld {
  position: { x: number; y: number }; // meters
  zoom: number; // factor
  mode: "follow" | "overview"; // determines how the camera behaves
  target?: EntityId; // entity ID to follow (only for "follow" mode)
}

/* SYMBOL */
export const Camera: ComponentType<CameraComponentOld> = 
  Symbol('Camera') as ComponentType<CameraComponentOld>;

/* FACTORY */
export function createCamera(
  position: { x: number; y: number }, // meters
  zoom: number,
  mode : "follow" | "overview",
  target?: EntityId
): CameraComponentOld {
  return {
    position,
    zoom,
    mode,
    target
  };
}