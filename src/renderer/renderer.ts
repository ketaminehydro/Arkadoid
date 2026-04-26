 /***************************************************************
ECS World
   ↓
buildRenderQueue
   ↓
RenderQueue (flat data)
   ↓
for each Camera:
   ↓
    opaquePass      (depth + lighting)
    transparentPass (sorted blending)
    emissivePass    (additive glow)
   ↓
GPU Draw Calls

**************************/



import { Camera, type CameraComponent } from '../components/camera';
import type { ComponentType } from '../ecs/component';
import type { World } from '../ecs/world';
import { Position } from '../components/position';
import type { EntityId } from '../ecs/entity.js';
import type { Sprite } from '../components/sprite';
import { FORWARD_EMISSIVE_FRAGMENT_SHADER_SOURCE } from './shaders/forwardEmissive.fragment';
import { FORWARD_LIT_FRAGMENT_SHADER_SOURCE } from './shaders/forwardLit.fragment';
import { FORWARD_VERTEX_SHADER_SOURCE } from './shaders/forward.vertex';

type Vec3 = { x: number; y: number; z: number };
type Mat4 = Float32Array;

type MeshData = {
  vao: WebGLVertexArrayObject;
  count: number;
  mode?: number;
};

type MaterialData = {
  shader?: WebGLProgram;
  uniforms?: Record<string, unknown>;
  type: 'opaque' | 'alphaTest' | 'transparent' | 'emissive';
};

type TransformData = {
  modelMatrix: Mat4;
  position: Vec3;
};

type LightComponentData = {
  position: Vec3;
  color: Vec3;
  intensity: number;
  radius: number;
};

type CameraData = {
  viewMatrix: Mat4;
  projectionMatrix: Mat4;
  viewport: { x: number; y: number; width: number; height: number };
  clearColor: boolean;
  position: Vec3;
};

type RenderItem = {
  mesh: MeshData;
  material: MaterialData;
  modelMatrix: Mat4;
  position: Vec3;
};

type LightData = {
  position: Vec3;
  color: Vec3;
  intensity: number;
  radius: number;
};

type RenderQueue = {
  cameras: CameraData[];
  items: RenderItem[];
  lights: LightData[];
};

type RendererState = {
  gl: WebGL2RenderingContext;
  litProgram: WebGLProgram;
  emissiveProgram: WebGLProgram;
  uniforms: {
    lit: {
      model: WebGLUniformLocation | null;
      view: WebGLUniformLocation | null;
      projection: WebGLUniformLocation | null;
      color: WebGLUniformLocation | null;
    };
    emissive: {
      model: WebGLUniformLocation | null;
      view: WebGLUniformLocation | null;
      projection: WebGLUniformLocation | null;
      color: WebGLUniformLocation | null;
    };
  };
};


// Initialize
const Mesh: ComponentType<MeshData> = Symbol('Mesh') as ComponentType<MeshData>;
const Material: ComponentType<MaterialData> = Symbol('Material') as ComponentType<MaterialData>;
const Transform: ComponentType<TransformData> = Symbol('Transform') as ComponentType<TransformData>;
const Light: ComponentType<LightComponentData> = Symbol('Light') as ComponentType<LightComponentData>;

const MAX_LIGHTS = 8;

let rendererState: RendererState | null = null;


// Test injection
function createTestMesh(gl: WebGL2RenderingContext) {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);

  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  const vertices = new Float32Array([
    -0.5, -0.5, 0,
     0.5, -0.5, 0,
     0.0,  0.5, 0
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);

  return {
    vao,
    count: 3
  };
}


// quad mesh for sprites
function createQuadMesh(gl: WebGL2RenderingContext): MeshData {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);

  const vertices = new Float32Array([
    // position    // uv
    -0.5, -0.5, 0,  0, 0,
     0.5, -0.5, 0,  1, 0,
     0.5,  0.5, 0,  1, 1,

    -0.5, -0.5, 0,  0, 0,
     0.5,  0.5, 0,  1, 1,
    -0.5,  0.5, 0,  0, 1,
  ]);

  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // position
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0);

  // uv
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 12);

  gl.bindVertexArray(null);

  return { vao, count: 6 };
}



// renderer
export function render(world: World): void {
  if (!rendererState) {
    rendererState = createRendererState();
  }

  const queue = buildRenderQueue(world);
  for (const camera of queue.cameras) {
    renderCamera(queue, camera);
  }
}

function buildRenderQueue(world: World): RenderQueue {
  const queue: RenderQueue = {
    cameras: [],
    items: [],
    lights: []
  };

  if (!rendererState) {
    return queue;
  }

  const canvas = rendererState.gl.canvas;

  for (const entityId of world.entities) {
    const camera = world.getComponent(entityId, Camera);
    if (camera) {
      queue.cameras.push(createCameraData(camera, canvas.width, canvas.height));
    }
  
    const mesh = world.getComponent(entityId, Mesh);
    const material = world.getComponent(entityId, Material);
    const transform = world.getComponent(entityId, Transform);
    if (mesh && material && transform) {
      queue.items.push({
        mesh,
        material,
        modelMatrix: transform.modelMatrix,
        position: transform.position
      });
    }

    const light = world.getComponent(entityId, Light);
    if (light) {
      queue.lights.push({
        position: light.position,
        color: light.color,
        intensity: light.intensity,
        radius: light.radius
      });
    }

// debug
  if (queue.items.length === 0) {
    console.log('No renderable items found, adding test mesh "triangle".');
  const mesh = createTestMesh(rendererState!.gl);

  queue.items.push({
    mesh,
    material: {
      type: "opaque",
      uniforms: { uColor: [1, 0, 0] }
    },
    modelMatrix: makeIdentityMatrix(),
    position: { x: 0, y: 0, z: 0 }
  });

  console.log(queue);
  
  }


  }

  return queue;
}

function makeOrthographicMatrix(
  left: number, right: number,
  bottom: number, top: number,
  near: number, far: number
): Mat4 {
  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);

  return new Float32Array([
    -2 * lr, 0, 0, 0,
    0, -2 * bt, 0, 0,
    0, 0, 2 * nf, 0,
    (left + right) * lr,
    (top + bottom) * bt,
    (far + near) * nf,
    1
  ]);
}

function renderCamera(queue: RenderQueue, camera: CameraData): void {
  if (!rendererState) {
    return;
  }

  const gl = rendererState.gl;
  gl.viewport(camera.viewport.x, camera.viewport.y, camera.viewport.width, camera.viewport.height);

  if (camera.clearColor) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  } else {
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(camera.viewport.x, camera.viewport.y, camera.viewport.width, camera.viewport.height);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
  }

  opaquePass(queue.items, queue.lights, camera);
  transparentPass(queue.items, camera);
  emissivePass(queue.items, camera);
  postProcessPass(camera);
}

function opaquePass(items: RenderItem[], lights: LightData[], camera: CameraData): void {
  for (const item of items) {
    if (item.material.type !== 'opaque' && item.material.type !== 'alphaTest') {
      continue;
    }

    const relevantLights: LightData[] = [];
    for (const light of lights) {
      if (distance(item.position, light.position) < light.radius) {
        relevantLights.push(light);
      }
      if (relevantLights.length >= MAX_LIGHTS) {
        break;
      }
    }

    drawLit(item, relevantLights, camera);
  }
}

function transparentPass(items: RenderItem[], camera: CameraData): void {
  if (!rendererState) {
    return;
  }

  const gl = rendererState.gl;
  const transparentItems = items.filter((item) => item.material.type === 'transparent');
  transparentItems.sort((left, right) => {
    const leftDistance = distance(left.position, camera.position);
    const rightDistance = distance(right.position, camera.position);
    return rightDistance - leftDistance;
  });

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(false);

  for (const item of transparentItems) {
    drawTransparent(item, camera);
  }

  gl.depthMask(true);
  gl.disable(gl.BLEND);
}

function emissivePass(items: RenderItem[], camera: CameraData): void {
  if (!rendererState) {
    return;
  }

  const gl = rendererState.gl;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.depthMask(false);

  for (const item of items) {
    if (item.material.type !== 'emissive') {
      continue;
    }
    drawEmissive(item, camera);
  }

  gl.depthMask(true);
  gl.disable(gl.BLEND);
}

function postProcessPass(_camera: CameraData): void {}

function drawLit(item: RenderItem, _relevantLights: LightData[], camera: CameraData): void {
  if (!rendererState) {
    return;
  }

  const { gl, litProgram, uniforms } = rendererState;
  gl.useProgram(litProgram);
  gl.bindVertexArray(item.mesh.vao);
  gl.uniformMatrix4fv(uniforms.lit.model, false, item.modelMatrix);
  gl.uniformMatrix4fv(uniforms.lit.view, false, camera.viewMatrix);
  gl.uniformMatrix4fv(uniforms.lit.projection, false, camera.projectionMatrix);
  gl.uniform3fv(uniforms.lit.color, readColor(item.material.uniforms?.uColor, [1, 1, 1]));
  gl.drawArrays(item.mesh.mode ?? gl.TRIANGLES, 0, item.mesh.count);
}

function drawTransparent(item: RenderItem, camera: CameraData): void {
  drawLit(item, [], camera);
}

function drawEmissive(item: RenderItem, camera: CameraData): void {
  if (!rendererState) {
    return;
  }

  const { gl, emissiveProgram, uniforms } = rendererState;
  gl.useProgram(emissiveProgram);
  gl.bindVertexArray(item.mesh.vao);
  gl.uniformMatrix4fv(uniforms.emissive.model, false, item.modelMatrix);
  gl.uniformMatrix4fv(uniforms.emissive.view, false, camera.viewMatrix);
  gl.uniformMatrix4fv(uniforms.emissive.projection, false, camera.projectionMatrix);
  gl.uniform3fv(
    uniforms.emissive.color,
    readColor(item.material.uniforms?.uEmissiveColor, [1, 1, 1])
  );
  gl.drawArrays(item.mesh.mode ?? gl.TRIANGLES, 0, item.mesh.count);
}

function createRendererState(): RendererState {
  const canvas = document.getElementById('game');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Game canvas is not available.');
  }

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    throw new Error('WebGL2 context is not available.');
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 1);

  const litProgram = createProgram(
    gl, 
    FORWARD_VERTEX_SHADER_SOURCE, 
    FORWARD_LIT_FRAGMENT_SHADER_SOURCE);
  
    const emissiveProgram = createProgram(
    gl,
    FORWARD_VERTEX_SHADER_SOURCE,
    FORWARD_EMISSIVE_FRAGMENT_SHADER_SOURCE
  );

  return {
    gl,
    litProgram,
    emissiveProgram,
    uniforms: {
      lit: {
        model: gl.getUniformLocation(litProgram, 'uModel'),
        view: gl.getUniformLocation(litProgram, 'uView'),
        projection: gl.getUniformLocation(litProgram, 'uProjection'),
        color: gl.getUniformLocation(litProgram, 'uColor')
      },
      emissive: {
        model: gl.getUniformLocation(emissiveProgram, 'uModel'),
        view: gl.getUniformLocation(emissiveProgram, 'uView'),
        projection: gl.getUniformLocation(emissiveProgram, 'uProjection'),
        color: gl.getUniformLocation(emissiveProgram, 'uEmissiveColor')
      }
    }
  };
}

function makePerspectiveMatrix(fov: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1.0 / Math.tan(fov / 2);
  const nf = 1 / (near - far);

  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, (2 * far * near) * nf, 0
  ]);
}

function makeTranslationMatrix(x: number, y: number, z: number): Mat4 {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1
  ]);
}

function createCameraData(camera: CameraComponent, width: number, height: number): CameraData {
  const vp = camera.viewport ?? { x: 0, y: 0, width: 1, height: 1 };

  const viewport = {
    x: vp.x * width,
    y: vp.y * height,
    width: vp.width * width,
    height: vp.height * height
  };

  const aspect = viewport.width / viewport.height;

  let projectionMatrix: Mat4;

  if (camera.projectionType === "orthographic" && camera.orthographic) {
    const o = camera.orthographic;
    projectionMatrix = makeOrthographicMatrix(
      o.left, o.right, o.bottom, o.top, o.near, o.far
    );
  } else {
    const p = camera.perspective ?? { fov: Math.PI / 3, near: 0.1, far: 100 };
    projectionMatrix = makePerspectiveMatrix(p.fov, aspect, p.near, p.far);
  }

  const z = 5 / (camera.zoom || 1);

  const position = {
    x: camera.position.x,
    y: camera.position.y,
    z
  };

  const viewMatrix = makeTranslationMatrix(-position.x, -position.y, -position.z);

  return {
    viewMatrix,
    projectionMatrix,
    viewport,
    clearColor: camera.clearColor ?? true,
    position
  };
}

function makeIdentityMatrix(): Mat4 {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
}

function readColor(value: unknown, fallback: [number, number, number]): [number, number, number] {
  if (Array.isArray(value) && value.length >= 3) {
    return [Number(value[0]), Number(value[1]), Number(value[2])];
  }
  return fallback;
}

function distance(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

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
    throw new Error(message ?? 'Shader program failed to link.');
  }

  return program;
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Unable to create shader.');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message ?? 'Shader failed to compile.');
  }

  return shader;
}

