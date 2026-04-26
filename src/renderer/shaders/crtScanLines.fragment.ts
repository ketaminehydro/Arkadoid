export const CRTSCANLINES_FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_texcoord;
uniform sampler2D u_texture;

void main() {
  vec4 color = texture2D(u_texture, v_texcoord);

  float scanline = sin(v_texcoord.y * 800.0) * 0.1;

  color.rgb -= scanline;

  // slight vignette
  float dist = distance(v_texcoord, vec2(0.5));
  color.rgb *= 1.0 - dist * 0.5;

  gl_FragColor = color;
}
  `;