/* TYPE */
import { ComponentType } from '../ecs/component';
export interface PositionComponent {
  x: number; // meters
  y: number; // meters
} 

/* SYMBOL */
export const Position: ComponentType<PositionComponent> = 
  Symbol('Position') as ComponentType<PositionComponent>;

  /* FACTORY */
export function createPosition(x = 0, y = 0): PositionComponent {
  return { x, y };
}