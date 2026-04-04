import { ComponentType } from '../ecs/component';
import { EntityId } from '../ecs/entity';

/* TYPE */
export interface CameraComponent {
  
  // CameraComponent
  position: { x: number; y: number }; // meters
  zoom: number; // factor
  mode: "follow" | "overview"; // determines how the camera behaves
  target?: EntityId; // entity ID to follow (only for "follow" mode)

  // CameraRenderComponent
  projectionType: "perspective" | "orthographic"

  perspective?: { fov: number, near : number, far: number }; 
      // angle, distance to projectionplane, distance to render border (look up WebGl perspective projection matrix math)
  orthographic?: { left : number, right: number, bottom : number, top : number, near : number, far : number}; 
      // coordinates of projectionplane, distance to projectionplane, distance to render edge (look up WebGl orthographic projection matric math)

  viewport: { x:number, y:number, width:number, height:number };  // viewport coordinates
  clearColor: boolean; // erase already rendered pixels or not
}

/* SYMBOL */
export const Camera: ComponentType<CameraComponent> = 
  Symbol('Camera') as ComponentType<CameraComponent>;

/* FACTORY */
export function createCamera(
  position: { x: number; y: number },
  zoom: number,
  mode: "follow" | "overview",
  target?: EntityId
): CameraComponent {
  return {  // debug: fixed values return
    position,
    zoom,
    mode,
    target,

    projectionType: "perspective",

    perspective: {
      fov: Math.PI / 3,
      near: 0.1,
      far: 100
    },

    viewport: { x: 0, y: 0, width: 1, height: 1 }, // normalized
    clearColor: true
  };
}