import { ComponentStore } from './componentStore.js';
import type { ComponentType } from './component.js';
import type { EntityId } from './entity';
import type { Query, QueryRecord } from './query';
import type { System } from './system';

export class World {
  nextEntityId: EntityId;
  entities: Set<EntityId>;
  componentStores: Map<ComponentType<unknown>, ComponentStore<unknown>>;

  private systems: System[];
  private queries: QueryRecord[];

  constructor() {
    this.nextEntityId = 0;
    this.entities = new Set();
    this.componentStores = new Map();
    this.systems = [];
    this.queries = [];
  }

  createEntity(): EntityId {
    const entityId = this.nextEntityId;
    this.nextEntityId += 1;
    this.entities.add(entityId);
    return entityId;
  }

  deleteEntity(entityId: EntityId): void {
    if (!this.entities.has(entityId)) {
      return;
    }

    this.entities.delete(entityId);

    for (const store of this.componentStores.values()) {
      store.delete(entityId);
    }

    for (const query of this.queries) {
      this.removeEntityFromQuery(query, entityId);
    }
  }

  addComponent<T>(entityId: EntityId, componentType: ComponentType<T>, component: T): void {
    let store = this.componentStores.get(componentType);
    if (!store) {
      store = new ComponentStore<T>();
      this.componentStores.set(componentType, store);
    }

    store.set(entityId, component);
    this.updateQueriesForEntity(entityId);
  }

  getComponent<T>(entityId: EntityId, componentType: ComponentType<T>): T | undefined {
    const store = this.componentStores.get(componentType) as ComponentStore<T> | undefined;
    return store?.get(entityId);
  }

  removeComponent(entityId: EntityId, componentType: ComponentType<unknown>): void {
    this.componentStores.get(componentType)?.delete(entityId);
    this.updateQueriesForEntity(entityId);
  }

  createQuery(...components: ComponentType<unknown>[]): Query {
    const query: QueryRecord = {
      required: [...components],
      entities: [],
      members: new Set<EntityId>(),
      entityIndex: new Map<EntityId, number>()
    };

    for (const entityId of this.entities) {
      if (this.entityMatchesComponents(entityId, query.required)) {
        this.addEntityToQuery(query, entityId);
      }
    }

    this.queries.push(query);
    return query;
  }

  addSystem(system: System): void {
    this.systems.push(system);
    this.systems.sort((left, right) => left.priority - right.priority);
  }

  runSystems(deltaTime: number): void {
    for (const system of this.systems) {
      system.update(this, deltaTime);
    }
  }

  private updateQueriesForEntity(entityId: EntityId): void {
    if (!this.entities.has(entityId)) {
      return;
    }

    for (const query of this.queries) {
      const matches = this.entityMatchesComponents(entityId, query.required);
      const alreadyTracked = query.members.has(entityId);

      if (matches && !alreadyTracked) {
        this.addEntityToQuery(query, entityId);
      } else if (!matches && alreadyTracked) {
        this.removeEntityFromQuery(query, entityId);
      }
    }
  }

  private entityMatchesComponents(entityId: EntityId, components: ComponentType<unknown>[]): boolean {
    for (const component of components) {
      if (!this.componentStores.get(component)?.has(entityId)) {
        return false;
      }
    }

    return true;
  }

  private addEntityToQuery(query: QueryRecord, entityId: EntityId): void {
    query.entityIndex.set(entityId, query.entities.length);
    query.entities.push(entityId);
    query.members.add(entityId);
  }

  private removeEntityFromQuery(query: QueryRecord, entityId: EntityId): void {
    const removeIndex = query.entityIndex.get(entityId);
    if (removeIndex === undefined) {
      return;
    }

    const lastIndex = query.entities.length - 1;
    const lastEntityId = query.entities[lastIndex];

    query.entities[removeIndex] = lastEntityId;
    query.entityIndex.set(lastEntityId, removeIndex);

    query.entities.pop();
    query.entityIndex.delete(entityId);
    query.members.delete(entityId);
  }
}
