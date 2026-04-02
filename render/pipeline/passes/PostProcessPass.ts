import type { RenderContext } from '../RenderContext';
import type { RenderPass } from '../RenderPass';

export class PostProcessPass implements RenderPass {
  execute(_context: RenderContext): void {
    console.log('PostProcessPass executed');
  }
}
