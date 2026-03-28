import type { EntityId } from './entity';

export class ComponentStore<T> {
  private store: Map<EntityId, T>;

  constructor() {
    this.store = new Map();
  }

  set(entityId: EntityId, component: T): void {
    this.store.set(entityId, component);
  }

  get(entityId: EntityId): T | undefined {
    return this.store.get(entityId);
  }

  has(entityId: EntityId): boolean {
    return this.store.has(entityId);
  }

  delete(entityId: EntityId): void {
    this.store.delete(entityId);
  }
}
