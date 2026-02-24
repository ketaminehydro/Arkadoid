export class MenuState {
  enter({ hud }) {
    hud.textContent = "MENU\nENTER: Start level\nESC: Back to title";
  }

  update({ input }, _dt, stack) {
    if (input.wasPressed("Enter")) {
      stack.push(new (this.nextState)());
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
