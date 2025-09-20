import { Position } from "../components/position.js";
import { Sprite } from "../components/sprite.js";
import { drawSprite } from "../render/glRenderer.js";

export function renderSystem(ecs, canvas) {
  for (const id of ecs.with(Position, Sprite)) {
    const pos = ecs.get(id, Position);
    const spr = ecs.get(id, Sprite);
    drawSprite(spr, pos, canvas);
  }
}