/* TYPE */
import { ComponentType } from '../ecs/component';
export interface VelocityComponent {
  vx: number;
  vy: number;
}

/* SYMBOL */
export const Velocity: ComponentType<VelocityComponent> = 
  Symbol('Velocity') as ComponentType<VelocityComponent>;

/* FACTORY */
export function createVelocity(vx = 0, vy = 0): VelocityComponent {
  return { vx, vy };
}
