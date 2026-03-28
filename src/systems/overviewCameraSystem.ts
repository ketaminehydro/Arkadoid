import type { World } from '../ecs/world.js';
import type { System } from '../ecs/system';
import { Camera } from '../components';
export const overviewCameraSystem : System = {
  name: "overviewCameraSystem",
  priority: 50,
  update: () => {
    return (world: World): void => {
      const cameras = world.getEntitiesWith(Camera);

      for (const entity of cameras) {
        const camera = world.getComponent(entity, Camera);

        if (camera?.mode !== "overview") continue;

        camera.position.x = 200 * 0.5;  // TODO: use world size instead of hardcoded values
        camera.position.y = 100 * 0.5;
      }
    };
  }
};