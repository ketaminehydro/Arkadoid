import { Body, Camera, Position } from '../components';
import type { ComponentType } from '../ecs/component.js';
import { World } from '../ecs/world.js';

export function setupDebug(world: World, entities: Record<string, number>): void {
  (window as Window & { DEBUG?: unknown }).DEBUG = {
    world,
    entities,
    getComponent<T>(entityName: string, componentType: ComponentType<T>): T | null {
      const entityId = entities[entityName];
      if (entityId === undefined) {
        console.warn(`Entity "${entityName}" not found`);
        return null;
      }

      return world.getComponent(entityId, componentType) ?? null;
    },
    logEntities(): void {
      console.table(
        Object.entries(entities).map(([name, id]) => ({
          name,
          id,
          Position: world.getComponent(id, Position),
          Body: world.getComponent(id, Body),
          Camera: world.getComponent(id, Camera)
        }))
      );
    }
  };

  console.log('%cDEBUG initialized. Access with DEBUG', 'color: orange; font-weight: bold;');
}
