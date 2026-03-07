export class ComponentStore {
  constructor() {
    this.store = new Map();
  }

  set(entityId, component) {
    this.store.set(entityId, component);
  }

  get(entityId) {
    return this.store.get(entityId);
  }

  has(entityId) {
    return this.store.has(entityId);
  }

  delete(entityId) {
    this.store.delete(entityId);
  }

  entries() {
    return this.store.entries();
  }
}
