import type { SpriteComponent } from '../utils/componentTypes.js';

export function createSprite(
  image: HTMLImageElement,
  width = 64,
  height = 64
): SpriteComponent {
  return { image, width, height };
}
