import type { World } from './world.js';

export function createEntity(world: World): number {
  const entityId = world.nextEntityId;
  world.nextEntityId += 1;
  world.entities.add(entityId);
  return entityId;
}

export function deleteEntity(world: World, entityId: number): void {
  if (!world.entities.has(entityId)) {
    return;
  }

  world.entities.delete(entityId);
  for (const store of world.componentStores.values()) {
    store.delete(entityId);
  }
}
