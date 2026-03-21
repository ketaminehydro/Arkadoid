interface GameLoop {
  start: () => void;
}

/* The createGameLoop function takes an update function as an argument and returns an object with a start method. 
The start method initiates the game loop by calling requestAnimationFrame with the frame function. 
The frame function calculates the time difference (deltaTime) since the last frame, 
calls the provided update function with this deltaTime, and then requests the next animation frame. 
This creates a continuous loop that updates the game state and renders it at a consistent frame rate. */ 
export function createGameLoop(update: (deltaTime: number) => void): GameLoop {
  let lastTime = performance.now();

  /* The frame function is called for each animation frame. It calculates the time difference (deltaTime) since the last frame, 
  calls the provided update function with this deltaTime, and then requests the next animation frame. */
  function frame(now: number): void {

    // Calculate deltaTime in seconds, capping it to 16ms (=60 FPS) to prevent large jumps
    const deltaTime = Math.min((now - lastTime) / 1000, 0.016);  
    lastTime = now;

    // Call the provided update function with the calculated deltaTime
    update(deltaTime);

    // Request the next frame
    requestAnimationFrame(frame);
  }

  return {
    // The start method initiates the game loop by calling requestAnimationFrame with the frame function
    start(): void {
      requestAnimationFrame(frame);
    }
  };
}
