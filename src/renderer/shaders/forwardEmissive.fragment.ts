export const FORWARD_EMISSIVE_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

out vec4 FragColor;

uniform vec3 uEmissiveColor;

void main() {
FragColor = vec4(uEmissiveColor, 1.0);
//FragColor = vec4(1.0, 0.0, 1.0, 1.0); // bright pink // debug 
}
`;
