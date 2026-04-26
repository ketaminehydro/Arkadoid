export const UVDEBUG_FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_texcoord;

void main() {
  gl_FragColor = vec4(v_texcoord, 0.0, 1.0);
}
`;