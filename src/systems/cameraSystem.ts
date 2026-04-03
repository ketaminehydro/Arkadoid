import type { ComponentType } from '../ecs/component';
import type { System } from '../ecs/system';
import type { World } from '../ecs/world';
import type { CameraComponent } from '../components/cameraComponent';
import type { CameraComputedComponent } from '../components/cameraComputedComponent';

const IDENTITY_MATRIX = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]);

interface CameraSystemConfig {
  world: World;
  cameraComponent: ComponentType<CameraComponent>;
  transformComponent: ComponentType<unknown>;
  cameraComputedComponent: ComponentType<CameraComputedComponent>;
}

function createIdentityMatrix(): Float32Array {
  return new Float32Array(IDENTITY_MATRIX);
}

export function createCameraSystem(config: CameraSystemConfig): System {
  const cameraEntities = config.world.createQuery(config.cameraComponent, config.transformComponent);

  return {
    name: 'cameraSystem',
    priority: 45,
    update(world: World): void {
      for (const entityId of cameraEntities.entities) {
        const computed: CameraComputedComponent = {
          viewMatrix: createIdentityMatrix(),
          projectionMatrix: createIdentityMatrix(),
          viewProjectionMatrix: createIdentityMatrix()
        };

        world.addComponent(entityId, config.cameraComputedComponent, computed);
      }
    }
  };
}
