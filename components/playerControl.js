export class PlayerControl {
  constructor({ acceleration = 250, maxSpeed = 300 } = {}) {
    this.acceleration = acceleration;
    this.maxSpeed = maxSpeed;
  }
}
