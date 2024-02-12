import { Point } from "./point";

export class Entity {
  mass: number
  screen: Point
  pos: Point
  velocity: Point
  collided: boolean

  constructor(screen: Point) {
    this.screen = screen;

    this.mass = Math.random() * 3 + 1;
    this.pos = new Point(
      screen.x * 0.375 * Math.random(),
      screen.y * 0.375 * Math.random()
    );

    this.velocity = new Point(
      Math.random() * (Math.round(Math.random()) * 2 - 1),
      Math.random() * (Math.round(Math.random()) * 2 - 1)
    );

    this.collided = false;
  }

  update() {
    const newX = this.pos.x + this.velocity.x;
    if (newX < this.mass || this.pos.x > this.screen.x - this.mass) {
      this.velocity.x = -this.velocity.x;
      this.pos.x += this.velocity.x;
    } else {
      this.pos.x = newX;
    }

    const newY = this.pos.y + this.velocity.y;
    if (newY < this.mass || this.pos.y > this.screen.y - this.mass) {
      this.velocity.y = -this.velocity.y;
      this.pos.y += this.velocity.y;
    } else {
      this.pos.y = newY;
    }
  }

  collision(other: Entity): void {
    const diff = new Point(other.pos.x - this.pos.x, other.pos.y - this.pos.y);
    const dist = Math.pow(diff.x, 2) + Math.pow(diff.y, 2);
    if (dist <= Math.pow(this.mass + other.mass, 2)) {
      this.collided = true;
      other.collided = true;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.collided ? "red" : "green";
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.mass, 0, Math.PI * 2);
    ctx.fill();
  }
}
