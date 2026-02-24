import { EntityManager } from "../ecs/entityManager.js";
import { SystemRunner } from "../ecs/systemRunner.js";
import { Position } from "../components/position.js";
import { Velocity } from "../components/velocity.js";
import { Sprite } from "../components/sprite.js";
import { PlayerControl } from "../components/playerControl.js";
import { movementSystem } from "../systems/movementSystem.js";
import { renderSystem } from "../systems/renderSystem.js";

export class GameState {
  constructor(texture) {
    this.texture = texture;
    this.ecs = new EntityManager();
    this.systemRunner = new SystemRunner();
  }

  enter({ hud, canvas }) {
    hud.textContent = "GAME\nMove: WASD / Arrow keys\nESC: Back to title";

    this.ecs.clear();
    const player = this.ecs.createEntity();
    this.ecs.addComponent(player, Position, new Position(canvas.width / 2, canvas.height / 2));
    this.ecs.addComponent(player, Velocity, new Velocity());
    this.ecs.addComponent(player, PlayerControl, new PlayerControl());
    this.ecs.addComponent(player, Sprite, new Sprite(this.texture, 64, 64));

    this.systemRunner = new SystemRunner();
    this.systemRunner.add((context, deltaTime) => movementSystem(context, deltaTime));
    this.systemRunner.add((context) => renderSystem(context.ecs, context.canvas));
  }

  update(context, deltaTime, stack) {
    if (context.input.wasPressed("Escape")) {
      stack.replace(this.createTitleState());
      return;
    }

    this.systemRunner.run(
      {
        ecs: this.ecs,
        input: context.input,
        bounds: { width: context.canvas.width, height: context.canvas.height },
        canvas: context.canvas
      },
      deltaTime
    );
  }

  createTitleState() {
    return this.titleStateFactory();
  }

  setTitleStateFactory(factory) {
    this.titleStateFactory = factory;
  }
}
