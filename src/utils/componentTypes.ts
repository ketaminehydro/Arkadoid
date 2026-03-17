export interface Vec2 {
  x: number;
  y: number;
}

export interface PositionComponent extends Vec2 {}

export interface VelocityComponent {
  vx: number;
  vy: number;
}

export interface SpriteComponent {
  image: HTMLImageElement;
  width: number;
  height: number;
}

export interface BodyComponent {
  width: number; // meters
  height: number; // meters
  color: string;
}

export interface CameraComponent {
  position: Vec2; // meters
  zoom: number;
  viewWidth: number; // meters
  viewHeight: number; // meters
}

export const Position = Symbol('Position');
export const Velocity = Symbol('Velocity');
export const Sprite = Symbol('Sprite');
export const Body = Symbol('Body');
export const Camera = Symbol('Camera');
