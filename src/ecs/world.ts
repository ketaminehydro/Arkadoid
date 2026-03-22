import { ComponentStore } from './componentStore.js';
import { ComponentType } from '../components/component';
import type { System } from './system';


export class World {
  nextEntityId: number;
  entities: Set<number>;
  componentStores: Map<ComponentType<any>, ComponentStore<any>>;
  private systems: System[] = [];

  constructor() {
    this.nextEntityId = 0;
    this.entities = new Set();
    this.componentStores = new Map();
    this.systems = [];
  }

  addComponent<T>(entityId: number, componentType: ComponentType<T>, component: T): void {
    let store = this.componentStores.get(componentType);
    if (!store) {
      store = new ComponentStore<unknown>();
      this.componentStores.set(componentType, store);
    }

    store.set(entityId, component);
  }

  getComponent<T>(entityId: number, componentType: ComponentType<T>): T | undefined {
  return this.componentStores.get(componentType)?.get(entityId) as T | undefined;
}

  removeComponent(entityId: number, componentType: ComponentType<any>): void {
    this.componentStores.get(componentType)?.delete(entityId);
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
  }


  runSystems(deltaTime: number): void {
    for (const system of this.systems) {
      system(this, deltaTime);
    }
  }
}
