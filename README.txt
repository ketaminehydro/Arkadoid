/**************************
   VISION: TARGET FOLDER STRUCTURE
***************************/

Arkadoid/
├── index.html
├── main.js                # Game loop + ECS boot
├── ecs/
│   ├── entityManager.js   # Entities + components registry
│   ├── systemRunner.js    # Calls each system per frame
│
├── components/
│   ├── position.js
│   ├── velocity.js
│   ├── gravitySource.js
│   ├── …
│
├── systems/
│   ├── movementSystem.js
│   ├── gravitySystem.js
│   └── renderSystem.js    # Canvas2D/WebGL
│
├── entities/
│   └── createPlayer.js
│   └── …
│
├── particles/
│   └── createPlayer.js
│
├── ui/
│   └── ingameUI.js
│   └── optionsUI.js
│   └── optionsUI.js
│
├── background/
│   └── createPlayer.js
│
├── titlecards/
│   └── screenGameOver.js
│
├── config/
│   └── constants.json
│   └── gamedata/
│        └── player1.json
│        └── …
│
└── lib/
    └── vector2d.js


/**************************
   IMMEDIATE DELIVERY GOAL
***************************/
- Build a clean asteroids clone foundation that respects the architecture above.
- Prioritize architecture and clean module boundaries over extra features.
- Sequence:
  1. Game-state stack (title/menu/level/game)
  2. Keyboard listener
  3. Movement system (ship control)


/**************************
   CURRENT IMPLEMENTED FOUNDATIONS
***************************/
- ECS foundations: `ecs/entityManager.js`, `ecs/systemRunner.js`
- State stack foundations: `gameStates/` (title, menu, level, game)
- Input foundations: `input/keyboard.js`
- Movement foundations: `systems/movementSystem.js`
- Rendering foundations: `render/glRenderer.js`, `systems/renderSystem.js`


/**************************
   CORE GAMELOOP (TARGET)
***************************/
1. Handle Input
2. Check Collisions
3. Update Entities
4. Update Particles
5. Draw


/**************************
   DOCUMENTATION (AUTOMATIC)
***************************/
─ Madge
─ TypeDoc + JSDoc
