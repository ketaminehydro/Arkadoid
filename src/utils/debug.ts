import { World } from '../ecs/world.js';
import { Camera, Position, Body } from '../utils/componentTypes.js';

/**
 * Expose runtime debug access to the browser console.
 * Allows inspecting world, entities, and cameras.
 */
export function setupDebug(world: World, entities: Record<string, number>): void {
  // Create a global DEBUG object
  (window as any).DEBUG = {
    world,
    entities,

    // Helper to get component by entity name
    getComponent(entityName: string, componentClass: any) {
      const entityId = entities[entityName];
      if (entityId === undefined) {
        console.warn(`Entity "${entityName}" not found`);
        return null;
      }
      return world.getComponent(entityId, componentClass);
    },

    // Helper to log all entities
    logEntities() {
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