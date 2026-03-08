import type { World } from '../ecs/world.js';
import { Position, Sprite } from '../utils/componentTypes.js';
import type { PositionComponent, SpriteComponent } from '../utils/componentTypes.js';

interface Renderer {
  clear: () => void;
  drawSprite: (sprite: SpriteComponent, position: PositionComponent) => void;
}

export function createRenderSystem(renderer: Renderer): (world: World) => void {
  return function renderSystem(world: World): void {
    renderer.clear();

    for (const entityId of world.getEntitiesWith(Position, Sprite)) {
      const position = world.getComponent<PositionComponent>(entityId, Position);
      const sprite = world.getComponent<SpriteComponent>(entityId, Sprite);

      if (!position || !sprite) {
        continue;
      }

      renderer.drawSprite(sprite, position);
    }
  };
}
