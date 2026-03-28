import { Velocity } from '../components';
import { getAxisX, getAxisY } from '../core/input.js';
import type { System } from '../ecs/system';
import type { World } from '../ecs/world';

interface PlayerControlSystemConfig {
  world: World;
  speed?: number;
}

const DEFAULT_PLAYER_SPEED = 8;

export function createPlayerControlSystem(config: PlayerControlSystemConfig): System {
  const controlledEntities = config.world.createQuery(Velocity);
  const speed = config.speed ?? DEFAULT_PLAYER_SPEED;

  return {
    name: 'playerControlSystem',
    priority: 10,
    update(world: World): void {
      const axisX = getAxisX();
      const axisY = getAxisY();

      for (const entityId of controlledEntities.entities) {
        const velocity = world.getComponent(entityId, Velocity)!;
        velocity.vx = axisX * speed;
        velocity.vy = axisY * speed;
      }
    }
  };
}
