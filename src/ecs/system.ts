// ecs/system.ts
import type { World } from './world';
export type System = (world: World, deltaTime: number) => void;