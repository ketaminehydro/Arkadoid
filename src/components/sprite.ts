import { ComponentType } from '../ecs/component';

/* TYPE */
export interface SpriteComponent {
  image: HTMLImageElement;
  width: number;
  height: number;
}

/* SYMBOL */
export const Sprite: ComponentType<SpriteComponent> = 
  Symbol('Sprite') as ComponentType<SpriteComponent>;

/* FACTORY */
export function createSprite(
  image: HTMLImageElement,
  width = 64,
  height = 64
): SpriteComponent {
  return { image, width, height };
}
