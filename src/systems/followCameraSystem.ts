import type { World } from '../ecs/world.js';
import type { System } from '../ecs/system';
import { Camera, Position } from '../components';
export const followCameraSystem: System = {
  name: "followCameraSystem",
  priority: 50,
  update: (world: World, deltaTime: number): void => {
    const cameras = world.getEntitiesWith(Camera);
    
    for (const entity of cameras) {
      const camera = world.getComponent(entity, Camera);
      
      if (!camera || camera.mode !== "follow" || camera.target === undefined) continue;

      const targetPos = world.getComponent(camera.target, Position);
      if (!targetPos) continue;

      camera.position.x = targetPos.x;
      camera.position.y = targetPos.y;

    }
  }
};