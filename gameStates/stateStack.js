export class StateStack {
  constructor(context) {
    this.context = context;
    this.stack = [];
  }

  push(state) {
    this.stack.push(state);
    state.enter?.(this.context);
  }

  pop() {
    const state = this.stack.pop();
    state?.exit?.(this.context);
    return state;
  }

  replace(state) {
    this.pop();
    this.push(state);
  }

  get current() {
    return this.stack[this.stack.length - 1] ?? null;
  }

  update(deltaTime) {
    this.current?.update?.(this.context, deltaTime, this);
  }
}
