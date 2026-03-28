import type { System } from '../ecs/system';
import type { World } from '../ecs/world';
import type { GameRenderer } from '../rendering/renderer.js';

interface RenderSystemConfig {
  renderer: GameRenderer;
}

export function createRenderSystem(config: RenderSystemConfig): System {
  return {
    name: 'renderSystem',
    priority: 100,
    update(world: World): void {
      config.renderer.render(world);
    }
  };
}
