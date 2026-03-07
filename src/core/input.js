const pressedKeys = new Set();

export function setupInput() {
  window.addEventListener('keydown', (event) => {
    pressedKeys.add(event.key.toLowerCase());
  });

  window.addEventListener('keyup', (event) => {
    pressedKeys.delete(event.key.toLowerCase());
  });
}

export function getAxisX() {
  const left = pressedKeys.has('a') ? -1 : 0;
  const right = pressedKeys.has('d') ? 1 : 0;
  return left + right;
}

export function getAxisY() {
  const up = pressedKeys.has('w') ? -1 : 0;
  const down = pressedKeys.has('s') ? 1 : 0;
  return up + down;
}
