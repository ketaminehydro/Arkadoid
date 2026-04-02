import type { RenderContext } from './RenderContext';
import type { RenderPass } from './RenderPass';

export class RenderPipeline {
  private readonly passes: RenderPass[];

  constructor(passes: RenderPass[]) {
    this.passes = passes;
  }

  execute(context: RenderContext): void {
    for (const pass of this.passes) {
      pass.execute(context);
    }
  }
}
