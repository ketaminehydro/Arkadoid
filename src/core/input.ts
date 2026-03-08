const pressedKeys = new Set<string>();

export function setupInput(): void {
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    pressedKeys.add(event.key.toLowerCase());
  });

  window.addEventListener('keyup', (event: KeyboardEvent) => {
    pressedKeys.delete(event.key.toLowerCase());
  });
}

export function getAxisX(): number {
  const left = pressedKeys.has('a') ? -1 : 0;
  const right = pressedKeys.has('d') ? 1 : 0;
  return left + right;
}

export function getAxisY(): number {
  const up = pressedKeys.has('w') ? -1 : 0;
  const down = pressedKeys.has('s') ? 1 : 0;
  return up + down;
}
