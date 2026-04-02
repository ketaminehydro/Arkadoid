export interface CameraComponent {
  type: 'perspective' | 'orthographic';
  fov?: number;
  near: number;
  far: number;
}
