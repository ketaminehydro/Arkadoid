interface GameLoop {
  start: () => void;
}

export function createGameLoop(update: (deltaTime: number) => void): GameLoop {
  let lastTime = performance.now();

  function frame(now: number): void {
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    update(deltaTime);
    requestAnimationFrame(frame);
  }

  return {
    start(): void {
      requestAnimationFrame(frame);
    }
  };
}
