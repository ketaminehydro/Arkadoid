import { Camera } from '../components';
import type { System } from '../ecs/system';
import type { World } from '../ecs/world';

interface OverviewCameraSystemConfig {
  world: World;
  worldWidth: number;
  worldHeight: number;
}

export function createOverviewCameraSystem(config: OverviewCameraSystemConfig): System {
  const cameraEntities = config.world.createQuery(Camera);

  return {
    name: 'overviewCameraSystem',
    priority: 50,
    update(world: World): void {
      const centerX = config.worldWidth * 0.5;
      const centerY = config.worldHeight * 0.5;

      for (const entityId of cameraEntities.entities) {
        const camera = world.getComponent(entityId, Camera)!;
        if (camera.mode !== 'overview') {
          continue;
        }

        camera.position.x = centerX;
        camera.position.y = centerY;
      }
    }
  };
}
