import type { World } from '../ecs/world.js';

import { Position, Camera } from '../components';
import type { GameRenderer } from '../rendering/Renderer.js';

interface RenderSystemConfig {
  renderer: GameRenderer;
  playerId: number;
  followCameraId: number;
  overviewCameraId: number;
  worldSize: { width: number; height: number };
}

export function createRenderSystem(config: RenderSystemConfig): (world: World) => void {
  return function renderSystem(world: World): void {
    const playerPosition = world.getComponent(config.playerId, Position);
    const followCamera = world.getComponent(config.followCameraId, Camera);
    const overviewCamera = world.getComponent(config.overviewCameraId, Camera);

    // Camera A follows the player in world meters.
    if (playerPosition && followCamera) {
      followCamera.x = playerPosition.x;
      followCamera.y = playerPosition.y;
    }

    // Camera B remains centered on the world.
    if (overviewCamera) {
      overviewCamera.x = config.worldSize.width * 0.5;
      overviewCamera.y = config.worldSize.height * 0.5;
    }

    config.renderer.render(world);
  };
}
