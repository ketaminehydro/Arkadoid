export class EntityManager {
  constructor() {
    this.entities = new Map();
    this.idCounter = 0;
  }

  createEntity() {
    const id = this.idCounter++;
    this.entities.set(id, new Map());
    return id;
  }

  addComponent(id, Comp, value) {
    if (!this.entities.has(id)) {
      this.entities.set(id, new Map());
    }

    this.entities.get(id).set(Comp, value);
  }

  getComponent(id, Comp) {
    return this.entities.get(id)?.get(Comp);
  }

  getEntitiesWith(...components) {
    const matches = [];

    for (const [id, componentMap] of this.entities.entries()) {
      if (components.every(component => componentMap.has(component))) {
        matches.push(id);
      }
    }

    return matches;
  }

  clear() {
    this.entities.clear();
    this.idCounter = 0;
  }
}
