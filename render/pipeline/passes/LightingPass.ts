import type { RenderContext } from '../RenderContext';
import type { RenderPass } from '../RenderPass';

export class LightingPass implements RenderPass {
  execute(_context: RenderContext): void {
    console.log('LightingPass executed');
  }
}
