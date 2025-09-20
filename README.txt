/**************************
   FOLDER STRUCTURE
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
   GAMELOOP
***************************/
1. Handle Input
2. Check Collisions
3. Update Entities
4. Update Particles
5. Draw



/**************************
   GAME STRUCTURE
***************************/

Title screen  -  Options

/**************************
   DOCUMENTATION (AUTOMATIC)
***************************/
─ Madge 
─ TypeDoc + JSDoc



/*********************************************OLD STUFF******************************
/**************************
   GAMELOOP
***************************/
Script 
   canvas

   game  
      inputHandler
         Event listeners
      display
      level
         players  
            player
               hitbox
               weapon?
         asteroids   
            asteroid
               hitbox
         projectiles 
            torpedo
               hitbox
         'gameobjects'
         
         starfield

         collisionChecker
            --> 'gameobjectarray'.'gameobject'.hitbox
         collisionResolver ('gameobject'-pairs)
            --> level

         -> generate asteroid (type)
         -> generate projectile (type)
         -> generate explosion () 
         -> generate powerup ()
         -> generate gravitywell () 
         -> generate ...all gameobject-types


      gameloop
         update level ()
         update display ()
         draw level ()
         draw display ()