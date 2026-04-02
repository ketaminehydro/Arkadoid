import type { RenderContext } from '../RenderContext';
import type { RenderPass } from '../RenderPass';

export class GeometryPass implements RenderPass {
  execute(_context: RenderContext): void {
    console.log('GeometryPass executed');
  }
}
