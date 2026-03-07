import { ComponentStore } from './componentStore.js';

export class World {
  constructor() {
    this.nextEntityId = 0;
    this.entities = new Set();
    this.componentStores = new Map();
    this.systems = [];
  }

  addComponent(entityId, componentType, component) {
    let store = this.componentStores.get(componentType);
    if (!store) {
      store = new ComponentStore();
      this.componentStores.set(componentType, store);
    }

    store.set(entityId, component);
  }

  getComponent(entityId, componentType) {
    return this.componentStores.get(componentType)?.get(entityId);
  }

  removeComponent(entityId, componentType) {
    this.componentStores.get(componentType)?.delete(entityId);
  }

  getEntitiesWith(...componentTypes) {
    const matches = [];
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

  addSystem(system) {
    this.systems.push(system);
  }

  runSystems(deltaTime) {
    for (const system of this.systems) {
      system(this, deltaTime);
    }
  }
}
