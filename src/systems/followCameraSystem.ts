import { Camera, Position } from '../components';
import type { System } from '../ecs/system';
import type { World } from '../ecs/world';

interface FollowCameraSystemConfig {
  world: World;
}

export function createFollowCameraSystem(config: FollowCameraSystemConfig): System {
  const cameraEntities = config.world.createQuery(Camera);

  return {
    name: 'followCameraSystem',
    priority: 50,
    update(world: World): void {
      for (const entityId of cameraEntities.entities) {
        const camera = world.getComponent(entityId, Camera)!;
        if (camera.mode !== 'follow' || camera.target === undefined) {
          continue;
        }

        const targetPosition = world.getComponent(camera.target, Position);
        if (!targetPosition) {
          continue;
        }

        camera.position.x = targetPosition.x;
        camera.position.y = targetPosition.y;
      }
    }
  };
}
