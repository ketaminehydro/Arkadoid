import type { World } from './world';

export interface System {
  name: string;
  priority: number;
  update(world: World, deltaTime: number): void;
}
