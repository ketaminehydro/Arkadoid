export const FORWARD_LIT_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

out vec4 FragColor;

uniform vec3 uColor;

void main() {
FragColor = vec4(uColor, 1.0);
//FragColor = vec4(1.0, 0.0, 1.0, 1.0); // bright pink // debug thsi is the one running
}
`;