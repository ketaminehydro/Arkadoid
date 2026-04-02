import type { RenderContext } from './RenderContext';

export interface RenderPass {
  execute(context: RenderContext): void;
}
