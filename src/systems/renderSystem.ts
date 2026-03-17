import type { World } from '../ecs/world.js';
import { Camera, Position } from '../utils/componentTypes.js';
import type { CameraComponent, PositionComponent } from '../utils/componentTypes.js';
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
    const playerPosition = world.getComponent<PositionComponent>(config.playerId, Position);
    const followCamera = world.getComponent<CameraComponent>(config.followCameraId, Camera);
    const overviewCamera = world.getComponent<CameraComponent>(config.overviewCameraId, Camera);

    // Camera A follows the player in world meters.
    if (playerPosition && followCamera) {
      followCamera.position.x = playerPosition.x;
      followCamera.position.y = playerPosition.y;
    }

    // Camera B remains centered on the world.
    if (overviewCamera) {
      overviewCamera.position.x = config.worldSize.width * 0.5;
      overviewCamera.position.y = config.worldSize.height * 0.5;
    }

    config.renderer.render(world);
  };
}
