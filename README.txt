/**************************
   OVERVIEW
***************************/
Arkadoid is an Asteroids clone, designed as a homage to 80's games.
It features emergent systemic gameplay.



/**************************
   FOLDER STRUCTURE
***************************/

project/
├── src/
│   ├── core/						/* runtime, engine */
│   │   ├── gameLoop.js
│   │   ├── renderer.js
│   │   └── input.js
│   │
│   ├── ecs/						/* ECS infrastructure */
│   │   ├── world.js				/* central registry */
│   │   ├── entity.js				/* ID creation and deletion */
│   │   └── componentStore.js		/* component storage */
│   │
│   ├── components/					/* data */
│   │   ├── position.js
│   │   ├── velocity.js
│   │   └── sprite.js
│   │
│   ├── systems/					/* logic */
│   │   ├── movementSystem.js
│   │   ├── collisionSystem.js
│   │   └── renderSystem.js
│   │
│   ├── entityFactories/			/* entity creation */
│   │   ├── player.js
│   │   ├── asteroid.js
│   │   └── bullet.js
│   │
│   ├── scenes/						/* levels */
│   │   └── level1.js
│   │
│   ├── utils/						/* helper functions */
│   │   └── math.js
│   │
│   └── main.js						/* entry point */
│
└── public/							/* static files */
	├── index.html
 	├── css/
 	└── assets/
 	    ├── sprites/
 	    ├── audio/
 	    ├── shaders/		
	    └── fonts/
 

/**************************
   RUNTIME FLOW
***************************/
index.html
   ↓
main.js
   ↓
core (loop/input/render)
   ↓
systems
   ↓
ecs (world + components)
   ↓
entities created by factories



/**************************
   DATA FLOW DIAGRAM 
   (Entities + Components + Systems)
***************************/

┌─────────────┐
│   Game Loop │
└───────┬─────┘
        │ calls each frame
        ▼
┌─────────────┐        ┌─────────────┐
│   Systems   │──────▶ │  Entities   │
│ (logic)     │        │ (data)      │
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
