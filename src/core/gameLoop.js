export function createGameLoop(update) {
  let lastTime = performance.now();

  function frame(now) {
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    update(deltaTime);
    requestAnimationFrame(frame);
  }

  return {
    start() {
      requestAnimationFrame(frame);
    }
  };
}
