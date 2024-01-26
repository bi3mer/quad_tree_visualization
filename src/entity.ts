import { Point } from "./point";

export class Entity {
  mass: number
  screen: Point
  pos: Point
  velocity: Point
  color: string

  constructor(screen: Point) {
    this.screen = screen;

    this.mass = Math.random() * 3 + 1;
    // this.pos = new Point(screen.x * Math.random(), screen.y * Math.random());
    this.pos = new Point(
      screen.x * 0.375 + screen.x * Math.random() * 0.25,
      screen.y * 0.375 + screen.y * Math.random() * 0.25
    );

    this.velocity = new Point(0, 0);

    this.color = 'green';
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

    // friction
    this.velocity.scalarMultiply(0.998);
  }

  collision(other: Entity): void {
    const diff = new Point(other.pos.x - this.pos.x, other.pos.y - this.pos.y);
    const dist = Math.hypot(diff.x, diff.y);
    if (dist <= this.mass + other.mass) {
      this.color = 'red';
      other.color = 'red';

      const norm = new Point(diff.x / dist, diff.y / dist);
      const diffV = new Point(this.velocity.x - other.velocity.x, this.velocity.y - other.velocity.y);
      const speed = diffV.x * norm.x + diffV.y * norm.y;
      if (speed < 0) {
        return;
      }

      const J = (2 * speed) / (this.mass + other.mass);
      this.velocity.x -= J * other.mass * norm.x;
      this.velocity.y -= J * other.mass * norm.y;
      other.velocity.x += J * this.mass * norm.x;
      other.velocity.x += J * this.mass * norm.y;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.mass, 0, Math.PI * 2);
    ctx.fill();
  }
}
