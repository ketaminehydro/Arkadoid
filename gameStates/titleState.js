export class TitleState {
  constructor(nextStateFactory) {
    this.nextStateFactory = nextStateFactory;
  }

  enter({ hud }) {
    hud.textContent = "ARKADOID - ASTEROIDS CLONE\nPress ENTER to open menu";
  }

  update({ input }, _dt, stack) {
    if (input.wasPressed("Enter")) {
      stack.push(this.nextStateFactory());
    }
  }
}
