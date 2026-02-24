import { Position } from "../components/position.js";
import { Sprite } from "../components/sprite.js";
import { beginFrame, drawSprite } from "../render/glRenderer.js";

export function renderSystem(ecs, canvas) {
  beginFrame(canvas);

  for (const id of ecs.getEntitiesWith(Position, Sprite)) {
    const pos = ecs.getComponent(id, Position);
    const spr = ecs.getComponent(id, Sprite);
    drawSprite(spr, pos, canvas);
  }
}
