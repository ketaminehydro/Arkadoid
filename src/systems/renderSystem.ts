import type { World } from '../ecs/world';
import type { System } from '../ecs/system';
import type { GameRenderer } from '../rendering/renderer';

interface RenderSystemConfig {
  renderer: GameRenderer;
}

export function createRenderSystem(config: RenderSystemConfig): System {
  return {
    name: "renderSystem",
    priority: 100,
    update: (world: World, deltaTime: number): void => {
      config.renderer.render(world);
    }
  };
}