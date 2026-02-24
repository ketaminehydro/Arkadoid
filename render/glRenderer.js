let gl;
let program;
let positionBuffer;
let texcoordBuffer;
let vao;

export function initGL(canvas) {
  gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("WebGL not supported");

  const vs = `
    attribute vec2 a_position;
    attribute vec2 a_texcoord;
    uniform vec2 u_resolution;
    varying vec2 v_texcoord;
    void main() {
      vec2 zeroToOne = a_position / u_resolution;
      vec2 clipSpace = zeroToOne * 2.0 - 1.0;
      gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
      v_texcoord = a_texcoord;
    }
  `;

  const fs = `
    precision mediump float;
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;
    void main() {
      gl_FragColor = texture2D(u_texture, v_texcoord);
    }
  `;

  program = createProgram(gl, vs, fs);
  gl.useProgram(program);

  positionBuffer = gl.createBuffer();
  texcoordBuffer = gl.createBuffer();

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const aPos = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  const aTex = gl.getAttribLocation(program, "a_texcoord");
  gl.enableVertexAttribArray(aTex);
  gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);
}

export function beginFrame(canvas) {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

export function drawSprite(sprite, position, canvas) {
  const { texture, width, height } = sprite;
  const { x, y } = position;

  const x1 = x;
  const y1 = y;
  const x2 = x + width;
  const y2 = y + height;

  gl.useProgram(program);
  gl.bindVertexArray(vao);

  gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);

  const positions = new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]);
  const texcoords = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function loadTexture(image) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

function createShader(glContext, type, source) {
  const shader = glContext.createShader(type);
  glContext.shaderSource(shader, source);
  glContext.compileShader(shader);

  if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
    throw new Error(glContext.getShaderInfoLog(shader));
  }

  return shader;
}

function createProgram(glContext, vertexSrc, fragmentSrc) {
  const vertexShader = createShader(glContext, glContext.VERTEX_SHADER, vertexSrc);
  const fragmentShader = createShader(glContext, glContext.FRAGMENT_SHADER, fragmentSrc);
  const nextProgram = glContext.createProgram();

  glContext.attachShader(nextProgram, vertexShader);
  glContext.attachShader(nextProgram, fragmentShader);
  glContext.linkProgram(nextProgram);

  if (!glContext.getProgramParameter(nextProgram, glContext.LINK_STATUS)) {
    throw new Error(glContext.getProgramInfoLog(nextProgram));
  }

  return nextProgram;
}
