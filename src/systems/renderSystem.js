import { Position, Sprite } from '../utils/componentTypes.js';

export function createRenderSystem(renderer) {
  return function renderSystem(world) {
    renderer.clear();

    for (const entityId of world.getEntitiesWith(Position, Sprite)) {
      const position = world.getComponent(entityId, Position);
      const sprite = world.getComponent(entityId, Sprite);
      renderer.drawSprite(sprite, position);
    }
  };
}
