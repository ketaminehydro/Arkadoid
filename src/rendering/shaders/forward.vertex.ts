export const FORWARD_VERTEX_SHADER_SOURCE = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

void main() {
//gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
gl_Position = vec4(aPosition, 1.0); //debug
}
`;
