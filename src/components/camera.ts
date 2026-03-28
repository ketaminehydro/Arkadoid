/* TYPE */
import { ComponentType } from '../ecs/component';
import { EntityId } from '../ecs/entity';
export interface CameraComponent {
  position: { x: number; y: number }; // meters
  zoom: number; // factor
  mode: "follow" | "overview"; // determines how the camera behaves
  target?: EntityId; // entity ID to follow (only for "follow" mode)
}

/* SYMBOL */
export const Camera: ComponentType<CameraComponent> = 
  Symbol('Camera') as ComponentType<CameraComponent>;

/* FACTORY */
export function createCamera(
  position: { x: number; y: number }, // meters
  zoom: number,
  mode : "follow" | "overview",
  target?: EntityId
): CameraComponent {
  return {
    position,
    zoom,
    mode,
    target
  };
}