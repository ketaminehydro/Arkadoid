export const FORWARD_LIT_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

out vec4 FragColor;

uniform vec3 uColor;

void main() {
FragColor = vec4(uColor, 1.0);
}
`;
