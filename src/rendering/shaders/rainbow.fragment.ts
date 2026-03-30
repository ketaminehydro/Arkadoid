export const RAINBOW_FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_texcoord;
uniform sampler2D u_texture;
uniform float u_time;

void main() {
  vec4 base = texture2D(u_texture, v_texcoord);

  float r = 0.5 + 0.5 * sin(10.0 * v_texcoord.x + u_time);
  float g = 0.5 + 0.5 * sin(10.0 * v_texcoord.y + u_time + 2.0);
  float b = 0.5 + 0.5 * sin(u_time + 4.0);

  vec3 rainbow = vec3(r, g, b);

  gl_FragColor = vec4(mix(base.rgb, rainbow, 0.5), base.a);
}
`;