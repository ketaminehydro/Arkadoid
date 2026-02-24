export class SystemRunner {
  constructor() {
    this.systems = [];
  }

  add(system) {
    this.systems.push(system);
  }

  run(context, deltaTime) {
    for (const system of this.systems) {
      system(context, deltaTime);
    }
  }
}
