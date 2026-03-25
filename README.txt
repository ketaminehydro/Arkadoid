/*****************************************************************
   OVERVIEW
*****************************************************************/
Arkadoid is an Asteroids clone, designed as a homage to 80's games.
It features emergent systemic gameplay.



/*****************************************************************
   FOLDER STRUCTURE
*****************************************************************/

project/
│   
├── src/
│   ├── core/						   /* runtime, engine */
│   │   ├── gameLoop.js          /* runs every frame: inputs, systems and renderer */
│   │   ├── renderer.js          /* WebGL renderer */
│   │   └── input.js             /* Input handler */
│   │
│   ├── ecs/						   /* ECS infrastructure */
│   │   ├── world.js				   /* orchestration: central registry of all entities, i.e. the world */
│   │   ├── entity.js				/* entity creation and deletion 
│   │   ├── system.ts            /* system type definition, i.e. format restriction for systems */
│   │   └── componentStore.js		/* storage: component storage, i.e. which entity has which data? */
│   │
│   ├── components/					/* components: definitions of attributes/data */
│   │   ├── position.js
│   │   ├── velocity.js
│   │   └── sprite.js
│   │
│   ├── systems/					   /* behaviour: definitions of the logic that acts on components */
│   │   ├── movementSystem.js
│   │   ├── collisionSystem.js
│   │   └── renderSystem.js
│   │
│   ├── entities/			         /* composition: definitions of entities and which components they have */
│   │   ├── player.js
│   │   ├── asteroid.js
│   │   └── bullet.js
│   │
│   ├── scenes/						/* setting: sets up a level/world and fills it with entities */
│   │   └── level1.js
│   │
│   ├── utils/						   /* helper functions */
│   │   └── math.js
│   │
│   └── main.js					   /* entry point */
│
├── public/							   /* static files */
│	├── css/
│	└── assets/
│	    ├── sprites/
│	    ├── audio/
│	    ├── shaders/		
│	    └── fonts/
│
├── package.json
├── tsconfig.json
└── index.html



/*****************************************************************
   RUNTIME FLOW    // TODO: revise this
*****************************************************************/
index.html
   ↓
main.js
   ↓
core (input/gameloop/render)
   ↓
systems
   ↓
ecs (world + components)
   ↓
entities created by factories



          systems
             ↓
          world
             ↓
     componentStore


/*****************************************************************
   DATA FLOW DIAGRAM  // TODO: revise this
   (Entities + Components + Systems)
*****************************************************************/

┌─────────────┐
│   Game Loop │
└───────┬─────┘
        │ calls each frame
        ▼
┌─────────────┐        ┌─────────────┐
│   Systems   │──────▶ │  Entities   │
│ (logic/     │        │  (data)     │
│  Behaviour) │        │             │
└─────────────┘        └──────┬──────┘
        ▲                     │
        │ uses components     │ has components
        │                     ▼
┌─────────────┐        ┌─────────────┐
│ Components  │        │ Sprites/    │
│ (Position,  │        │ Audio, etc. │
│ Velocity,   │        └─────────────┘
│ Health…)    │
└─────────────┘

World
→ owns everything mutable

Entities (factories)
→ describe compositions

Systems
→ operate on data


/*****************************************************************
   RENDER PIPELINE
*****************************************************************/

WORLD (meters, large)
      ↓
CAMERA ENTITY (meters)
      ↓
  (conversion: meters → pixels)
      ↓
GPU PIPELINE
    Vertex Shader
         ↓
    Rasterization
         ↓
    Fragment/Pixel Shader
         ↓
VIRTUAL CANVAS (pixels: 960 x 540)
      ↓
  (scaling: pixel perfect integer scaling with letterboxing)
  (according to screen size, recalculated on the fly on window resize) 
      ↓
SCREEN

________________________________

ECS World (data)
   ↓
Render System (extracts visible things)
   ↓
Renderer (GPU / WebGL execution)

________________________________

[ LEVEL ]        → what exists 
[ ECS ]          → data + logic
[ RENDER SYSTEM ]→ extracts render data
[ RENDERER ]     → GPU execution

level1.ts        → creates entities
systems/         → gameplay + render system
rendering/       → WebGL stuff
main.ts          → wires everything together



/*****************************************************************
   Entity Component System (ECS) structure
*****************************************************************/
LAYER	      : RESPONSIBILITY 
Level	      : Entities & composition
Systems	   : Behavior
Renderer	   : Drawing
App/Main	   : Wiring everything together