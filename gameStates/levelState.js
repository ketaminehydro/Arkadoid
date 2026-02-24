export class LevelState {
  enter({ hud }) {
    hud.textContent = "LEVEL 1\nENTER: Launch\nESC: Back to menu";
  }

  update({ input }, _dt, stack) {
    if (input.wasPressed("Enter")) {
      stack.replace(new (this.nextState)());
      return;
    }

    if (input.wasPressed("Escape")) {
      stack.pop();
    }
  }

  constructor(nextState) {
    this.nextState = nextState;
  }
}
