import type { CameraComponent } from '../../components/CameraComponent';
import type { CameraComputedComponent } from '../../components/CameraComputedComponent';
import type { ViewportComponent } from '../../components/ViewportComponent';

export interface RenderContextCamera {
  entityId: number;
  camera: CameraComponent;
  computed: CameraComputedComponent;
  viewport: ViewportComponent;
}

export interface RenderContext {
  cameras: RenderContextCamera[];
}
