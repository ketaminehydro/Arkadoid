export class Keyboard {
  constructor(target = window) {
    this.target = target;
    this.down = new Set();
    this.justPressed = new Set();

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  attach() {
    this.target.addEventListener("keydown", this.onKeyDown);
    this.target.addEventListener("keyup", this.onKeyUp);
  }

  detach() {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.down.clear();
    this.justPressed.clear();
  }

  endFrame() {
    this.justPressed.clear();
  }

  isDown(code) {
    return this.down.has(code);
  }

  wasPressed(code) {
    return this.justPressed.has(code);
  }

  onKeyDown(event) {
    if (!this.down.has(event.code)) {
      this.justPressed.add(event.code);
    }

    this.down.add(event.code);
  }

  onKeyUp(event) {
    this.down.delete(event.code);
  }
}
