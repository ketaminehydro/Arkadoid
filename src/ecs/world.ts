import { ComponentStore } from './componentStore.js';
import { ComponentType } from './component.js';
import type { System } from './system';
import type { EntityId } from './entity';


export class World {
  nextEntityId: EntityId;
  entities: Set<EntityId>;
  componentStores: Map<ComponentType<any>, ComponentStore<any>>;
  private systems: System[] = [];

  constructor() {
    this.nextEntityId = 0;
    this.entities = new Set();
    this.componentStores = new Map();
    this.systems = [];
  }

  addComponent<T>(entityId: EntityId, componentType: ComponentType<T>, component: T): void {
    let store = this.componentStores.get(componentType);
    if (!store) {
      store = new ComponentStore<unknown>();
      this.componentStores.set(componentType, store);
    }

    store.set(entityId, component);
  }

  getComponent<T>(entityId: EntityId, componentType: ComponentType<T>): T | undefined {
    return this.componentStores.get(componentType)?.get(entityId) as T | undefined;
  }

  removeComponent(entityId: EntityId, componentType: ComponentType<any>): void {
    this.componentStores.get(componentType)?.delete(entityId);
  }

createEntity(): EntityId {
  const entityId = this.nextEntityId;
  this.nextEntityId += 1;
  this.entities.add(entityId);
  return entityId;
}

deleteEntity(entityId: EntityId): void {
  if (!this.entities.has(entityId)) return;

  this.entities.delete(entityId);

  for (const store of this.componentStores.values()) {
    store.delete(entityId);
  }
}

  getEntitiesWith(...componentTypes: ComponentType<any>[]): number[] {
    const matches: number[] = [];
    for (const entityId of this.entities) {
      const hasAll = componentTypes.every((componentType) =>
        this.componentStores.get(componentType)?.has(entityId)
      );
      if (hasAll) {
        matches.push(entityId);
      }
    }
    return matches;
  }

  addSystem(system: System): void {
    this.systems.push(system);

    // sort the systems
    this.systems.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    
    /* Mental map for ordering: lower runs first 
      InputSystem        → priority: 10
      MovementSystem     → priority: 20
      CollisionSystem    → priority: 30
      GameplaySystem     → priority: 40
      AnimationSystem    → priority: 50
      RenderSystem       → priority: 100
    */
  }

  // run all systems with the given delta time. This function is called in the main game loop, 
  // and it will execute each system in the order they were added to the world.
  runSystems(deltaTime: number): void {
    for (const system of this.systems) {
      system.update(this, deltaTime);
    }
  }
}
