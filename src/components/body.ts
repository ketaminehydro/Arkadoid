/* TYPE */
import { ComponentType } from '../ecs/component';
export interface BodyComponent {
  width: number; // meters
  height: number; // meters
  color: string;
}

/* SYMBOL */
export const Body: ComponentType<BodyComponent> = 
  Symbol('Body') as ComponentType<BodyComponent>;

/* FACTORY */
export function createBody(width: number, height: number, color: string): BodyComponent {
  return { width, height, color };
}
