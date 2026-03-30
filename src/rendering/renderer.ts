import { Sprite } from '../components';
import { Body } from '../components/body';
import { Camera, type CameraComponent } from '../components/camera';
import { Position } from '../components/position';
import type { World } from '../ecs/world';
import { getPixelsPerMeter } from './cameraMath';

import { BLIT_FRAGMENT_SHADER_SOURCE } from './shaders/blit.fragment';
import { CRTSCANLINES_FRAGMENT_SHADER_SOURCE } from './shaders/crtScanLines.fragment';
import { RAINBOW_FRAGMENT_SHADER_SOURCE } from './shaders/rainbow.fragment';
import { UVDEBUG_FRAGMENT_SHADER_SOURCE } from './shaders/uvDebug.fragment';

import { FULLSCREEN_VERTEX_SHADER_SOURCE } from './shaders/fullscreen.vertex';

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

interface RenderItem {
  position: { x: number; y: number };
  size: { x: number; y: number };
  rotation: number;
  image?: HTMLImageElement;
  color?: string;
}

interface ShaderPass {
  program: WebGLProgram;
  positionLocation: number;
  texcoordLocation: number;
  resolutionLocation: WebGLUniformLocation | null;
  textureLocation: WebGLUniformLocation | null;
  timeLocation?: WebGLUniformLocation | null;
}

interface RenderTarget {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
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

  const blitTexture = createTexture(gl, VIRTUAL_RESOLUTION.width, VIRTUAL_RESOLUTION.height);
  const ping = createRenderTarget(gl, VIRTUAL_RESOLUTION.width, VIRTUAL_RESOLUTION.height);
  const pong = createRenderTarget(gl, VIRTUAL_RESOLUTION.width, VIRTUAL_RESOLUTION.height);

  const positionBuffer = gl.createBuffer();
  const texcoordBuffer = gl.createBuffer();
  if (!positionBuffer || !texcoordBuffer) {
    throw new Error('Unable to create WebGL resources.');
  }

  // Shader passes can be added here to create a post-processing pipeline. 
  const blitPass = createShaderPass(
    gl,
    FULLSCREEN_VERTEX_SHADER_SOURCE,
    BLIT_FRAGMENT_SHADER_SOURCE
  );

  const rainbowPass = createShaderPass(
    gl,
    FULLSCREEN_VERTEX_SHADER_SOURCE,
    RAINBOW_FRAGMENT_SHADER_SOURCE
  );

  const crtScanLinesPass = createShaderPass(
    gl,
    FULLSCREEN_VERTEX_SHADER_SOURCE,
    CRTSCANLINES_FRAGMENT_SHADER_SOURCE
  );  

  const uvDebugPass = createShaderPass(
    gl,
    FULLSCREEN_VERTEX_SHADER_SOURCE,
    UVDEBUG_FRAGMENT_SHADER_SOURCE
  );  

  const pipeline: ShaderPass[] = [crtScanLinesPass, rainbowPass, blitPass];

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

    gl.bindTexture(gl.TEXTURE_2D, blitTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, virtualCanvas);

    executePipeline(blitTexture);
  }

  function executePipeline(initialTexture: WebGLTexture): void {
    let inputTexture = initialTexture;

    for (let index = 0; index < pipeline.length; index += 1) {
      const pass = pipeline[index];
      const isFinalPass = index === pipeline.length - 1;

      if (isFinalPass) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        drawPass(pass, inputTexture, {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight,
          resolutionWidth: canvas.width,
          resolutionHeight: canvas.height
        });
      } else {
        const outputTarget = index % 2 === 0 ? ping : pong;
        gl.bindFramebuffer(gl.FRAMEBUFFER, outputTarget.framebuffer);

        // clear intermediate framebuffers
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // correct viewport for texture size
        gl.viewport(0, 0, VIRTUAL_RESOLUTION.width, VIRTUAL_RESOLUTION.height);

        drawPass(pass, inputTexture, {
          x: 0,
          y: 0,
          width: VIRTUAL_RESOLUTION.width,
          height: VIRTUAL_RESOLUTION.height,
          resolutionWidth: VIRTUAL_RESOLUTION.width,
          resolutionHeight: VIRTUAL_RESOLUTION.height
        });
        inputTexture = outputTarget.texture;
      }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function drawPass(
    pass: ShaderPass,
    inputTexture: WebGLTexture,
    outputRect: {
      x: number;
      y: number;
      width: number;
      height: number;
      resolutionWidth: number;
      resolutionHeight: number;
    }
  ): void {
    gl.useProgram(pass.program);

    const x1 = outputRect.x;
    const y1 = outputRect.y;
    const x2 = outputRect.x + outputRect.width;
    const y2 = outputRect.y + outputRect.height;

    const positions = new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]);
    const texcoords = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    if (pass.positionLocation !== -1) {
      gl.enableVertexAttribArray(pass.positionLocation);
      gl.vertexAttribPointer(pass.positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.DYNAMIC_DRAW);
    if (pass.texcoordLocation !== -1) {
      gl.enableVertexAttribArray(pass.texcoordLocation);
      gl.vertexAttribPointer(pass.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    }
    
    if (pass.resolutionLocation) {
      gl.uniform2f(pass.resolutionLocation, outputRect.resolutionWidth, outputRect.resolutionHeight);
    }

    if (pass.timeLocation) {
      gl.uniform1f(pass.timeLocation, performance.now() * 0.001);
    }

    if (pass.textureLocation) {
      bindInputTexture(gl, pass, inputTexture, 0);
    }

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

  function extractRenderItems(world: World, bodyEntities: number[]): RenderItem[] {
    const items: RenderItem[] = [];

    for (const entityId of bodyEntities) {
      const position = world.getComponent(entityId, Position);
      const body = world.getComponent(entityId, Body);

      if (!position || !body) {
        continue;
      }

      const sprite = world.getComponent(entityId, Sprite);

      items.push({
        position: { x: position.x, y: position.y },
        size: { x: body.width, y: body.height },
        rotation: 0,
        image: sprite?.image,
        color: body.color
      });
    }

    return items;
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
    const renderItems = extractRenderItems(world, bodyEntities);
    drawRenderItems(viewport, camera, renderItems);

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

  function drawRenderItems(
    viewport: Viewport,
    camera: CameraComponent,
    renderItems: RenderItem[]
  ): void {
    for (const item of renderItems) {
      const pixelsPerMeter = getPixelsPerMeter(camera);
      const center = worldToViewportPixels(item.position, camera, viewport);
      const pixelWidth = item.size.x * pixelsPerMeter;
      const pixelHeight = item.size.y * pixelsPerMeter;

      if (item.image) {
        ctx.drawImage(
          item.image,
          Math.round(center.x - pixelWidth * 0.5),
          Math.round(center.y - pixelHeight * 0.5),
          Math.round(pixelWidth),
          Math.round(pixelHeight)
        );
      } else {
        ctx.fillStyle = item.color ?? '#ffffff';
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

function createShaderPass(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
): ShaderPass {
  const program = createProgram(gl, vertexSource, fragmentSource);

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');

  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const textureLocation = gl.getUniformLocation(program, 'u_texture');
  const timeLocation = gl.getUniformLocation(program, 'u_time');

  return {
    program,
    positionLocation,
    texcoordLocation,
    resolutionLocation,
    textureLocation,
    timeLocation
  };
}

function bindInputTexture(
  gl: WebGLRenderingContext,
  pass: ShaderPass,
  texture: WebGLTexture,
  textureUnit: number
): void {
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(pass.textureLocation, textureUnit);
}

function createRenderTarget(gl: WebGLRenderingContext, width: number, height: number): RenderTarget {
  const texture = createTexture(gl, width, height);
  const framebuffer = gl.createFramebuffer();

  if (!framebuffer) {
    throw new Error('Unable to create framebuffer.');
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error('Unable to initialize framebuffer.');
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return { texture, framebuffer };
}

function createTexture(gl: WebGLRenderingContext, width: number, height: number): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error('Unable to create texture.');
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  return texture;
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
