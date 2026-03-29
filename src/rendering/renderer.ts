import { Sprite } from '../components';
import { Body } from '../components/body';
import { Camera, type CameraComponent } from '../components/camera';
import { Position } from '../components/position';
import type { World } from '../ecs/world';
import { getPixelsPerMeter } from './cameraMath';
import type { Viewport } from './viewport';
import type { WorldBounds } from './worldBounds';

export const VIRTUAL_RESOLUTION = {
  width: 960,
  height: 540
} as const;

interface RenderConfig {
  viewports: Viewport[];
  worldBounds: WorldBounds;
}

export interface GameRenderer {
  render(world: World): void;
  resizeToWindow(): void;
}

export function createRenderer(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement,
  config: RenderConfig
): GameRenderer {
  const virtualCanvas = document.createElement('canvas');
  virtualCanvas.width = VIRTUAL_RESOLUTION.width;
  virtualCanvas.height = VIRTUAL_RESOLUTION.height;

  const virtualContext = virtualCanvas.getContext('2d');
  if (!virtualContext) {
    throw new Error('Virtual 2D context is not available.');
  }
  const ctx = virtualContext;
  ctx.imageSmoothingEnabled = false;

  const bodyQueryByWorld = new WeakMap<World, ReturnType<World['createQuery']>>();

  const program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
  const positionBuffer = gl.createBuffer();
  const texcoordBuffer = gl.createBuffer();
  const blitTexture = gl.createTexture();

  if (!positionBuffer || !texcoordBuffer || !blitTexture) {
    throw new Error('Unable to create WebGL resources.');
  }

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const textureLocation = gl.getUniformLocation(program, 'u_texture');

  if (!resolutionLocation || !textureLocation) {
    throw new Error('Unable to find required WebGL uniforms.');
  }

  gl.bindTexture(gl.TEXTURE_2D, blitTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    VIRTUAL_RESOLUTION.width,
    VIRTUAL_RESOLUTION.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );

  let scale = 1;
  let drawX = 0;
  let drawY = 0;
  let drawWidth = VIRTUAL_RESOLUTION.width;
  let drawHeight = VIRTUAL_RESOLUTION.height;

  function resizeToWindow(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    scale = Math.max(
      1,
      Math.floor(
        Math.min(canvas.width / VIRTUAL_RESOLUTION.width, canvas.height / VIRTUAL_RESOLUTION.height)
      )
    );

    drawWidth = VIRTUAL_RESOLUTION.width * scale;
    drawHeight = VIRTUAL_RESOLUTION.height * scale;
    drawX = Math.floor((canvas.width - drawWidth) * 0.5);
    drawY = Math.floor((canvas.height - drawHeight) * 0.5);
  }

  function render(world: World): void {
    clearVirtualSurface();

    const bodyEntities = getBodyQuery(world).entities;

    for (const viewport of config.viewports) {
      renderViewport(world, viewport, bodyEntities);
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    const x1 = drawX;
    const y1 = drawY;
    const x2 = drawX + drawWidth;
    const y2 = drawY + drawHeight;

    const positions = new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]);
    const texcoords = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, blitTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, virtualCanvas);
    gl.uniform1i(textureLocation, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function getBodyQuery(world: World): ReturnType<World['createQuery']> {
    const cachedQuery = bodyQueryByWorld.get(world);
    if (cachedQuery) {
      return cachedQuery;
    }

    const query = world.createQuery(Position, Body);
    bodyQueryByWorld.set(world, query);
    return query;
  }

  function clearVirtualSurface(): void {
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, VIRTUAL_RESOLUTION.width, VIRTUAL_RESOLUTION.height);
  }

  function renderViewport(world: World, viewport: Viewport, bodyEntities: number[]): void {
    const camera = world.getComponent(viewport.cameraId, Camera);
    if (!camera) {
      return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
    ctx.clip();

    ctx.fillStyle = '#0f1720';
    ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
    ctx.strokeStyle = '#324156';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewport.x + 1, viewport.y + 1, viewport.width - 2, viewport.height - 2);

    drawWorldBounds(viewport, camera, config.worldBounds);
    drawBodies(world, viewport, camera, bodyEntities);

    ctx.restore();
  }

  function drawWorldBounds(viewport: Viewport, camera: CameraComponent, bounds: WorldBounds): void {
    const topLeft = worldToViewportPixels({ x: 0, y: 0 }, camera, viewport);
    const bottomRight = worldToViewportPixels({ x: bounds.width, y: bounds.height }, camera, viewport);

    ctx.strokeStyle = '#5f7ca0';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      Math.round(topLeft.x),
      Math.round(topLeft.y),
      Math.round(bottomRight.x - topLeft.x),
      Math.round(bottomRight.y - topLeft.y)
    );
  }

  function drawBodies(
    world: World,
    viewport: Viewport,
    camera: CameraComponent,
    bodyEntities: number[]
  ): void {
    for (const entityId of bodyEntities) {
      const position = world.getComponent(entityId, Position)!;
      const body = world.getComponent(entityId, Body)!;

      const pixelsPerMeter = getPixelsPerMeter(camera);
      const center = worldToViewportPixels(position, camera, viewport);
      const pixelWidth = body.width * pixelsPerMeter;
      const pixelHeight = body.height * pixelsPerMeter;

      // Sprite
      const sprite = world.getComponent(entityId, Sprite); 
      if (sprite?.image) {
        ctx.drawImage(
          sprite.image,
          Math.round(center.x - pixelWidth * 0.5),
          Math.round(center.y - pixelHeight * 0.5),
          Math.round(pixelWidth),
          Math.round(pixelHeight)
        );
      } else { // fallback if image somehow not available 
        ctx.fillStyle = body.color;
        ctx.fillRect(
          Math.round(center.x - pixelWidth * 0.5),
          Math.round(center.y - pixelHeight * 0.5),
          Math.round(pixelWidth),
          Math.round(pixelHeight)
        );
      }
    }
  }

  function worldToViewportPixels(
    worldPositionMeters: { x: number; y: number },
    camera: CameraComponent,
    viewport: Viewport
  ): { x: number; y: number } {
    const pixelsPerMeter = getPixelsPerMeter(camera);

    return {
      x: (worldPositionMeters.x - camera.position.x) * pixelsPerMeter + viewport.x + viewport.width * 0.5,
      y: (worldPositionMeters.y - camera.position.y) * pixelsPerMeter + viewport.y + viewport.height * 0.5
    };
  }

  resizeToWindow();

  return { render, resizeToWindow };
}

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Unable to create shader.');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${message}`);
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  if (!program) {
    throw new Error('Unable to create shader program.');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${message}`);
  }

  return program;
}

const VERTEX_SHADER_SOURCE = `
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

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
varying vec2 v_texcoord;
uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, v_texcoord);
}
`;
