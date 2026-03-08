export class ComponentStore<T = unknown> {
  private store: Map<number, T>;

  constructor() {
    this.store = new Map();
  }

  set(entityId: number, component: T): void {
    this.store.set(entityId, component);
  }

  get(entityId: number): T | undefined {
    return this.store.get(entityId);
  }

  has(entityId: number): boolean {
    return this.store.has(entityId);
  }

  delete(entityId: number): void {
    this.store.delete(entityId);
  }

  entries(): IterableIterator<[number, T]> {
    return this.store.entries();
  }
}
