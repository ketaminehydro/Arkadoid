import type { System } from '../ecs/system';
import type { World } from '../ecs/world';
import { render } from '../renderer/renderer';

export function createRenderSystem(): System {
  return {
    name: 'renderSystem',
    priority: 100,
    update(world: World): void {
      render(world);
    }
  };
}
