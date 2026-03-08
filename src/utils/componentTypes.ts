export interface PositionComponent {
  x: number;
  y: number;
}

export interface VelocityComponent {
  vx: number;
  vy: number;
}

export interface SpriteComponent {
  image: HTMLImageElement;
  width: number;
  height: number;
}

export const Position = Symbol('Position');
export const Velocity = Symbol('Velocity');
export const Sprite = Symbol('Sprite');
