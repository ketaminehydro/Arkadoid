import { Position } from "../components/position.js";
import { Velocity } from "../components/velocity.js";
import { PlayerControl } from "../components/playerControl.js";

export function movementSystem({ ecs, input, bounds }, deltaTime) {
  const ids = ecs.getEntitiesWith(Position, Velocity, PlayerControl);

  for (const id of ids) {
    const position = ecs.getComponent(id, Position);
    const velocity = ecs.getComponent(id, Velocity);
    const control = ecs.getComponent(id, PlayerControl);

    const axisX = Number(input.isDown("ArrowRight") || input.isDown("KeyD"))
      - Number(input.isDown("ArrowLeft") || input.isDown("KeyA"));
    const axisY = Number(input.isDown("ArrowDown") || input.isDown("KeyS"))
      - Number(input.isDown("ArrowUp") || input.isDown("KeyW"));

    velocity.x += axisX * control.acceleration * deltaTime;
    velocity.y += axisY * control.acceleration * deltaTime;

    const speed = Math.hypot(velocity.x, velocity.y);
    if (speed > control.maxSpeed) {
      const scale = control.maxSpeed / speed;
      velocity.x *= scale;
      velocity.y *= scale;
    }

    const drag = Math.pow(0.92, deltaTime * 60);
    velocity.x *= drag;
    velocity.y *= drag;

    position.x = wrap(position.x + velocity.x * deltaTime, bounds.width);
    position.y = wrap(position.y + velocity.y * deltaTime, bounds.height);
  }
}

function wrap(value, max) {
  if (value < 0) return value + max;
  if (value >= max) return value - max;
  return value;
}
