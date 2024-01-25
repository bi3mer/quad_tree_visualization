import { Point } from "./point";

export class Entity {
  screen: Point
  pos: Point
  size: Point
  velocity: Point

  constructor(screen: Point) {
    this.screen = screen;
    // this.pos = new Point(screen.x * Math.random(), screen.y * Math.random());
    this.pos = new Point(screen.x * Math.random() * 0.25, screen.y * Math.random() * 0.25);
    // this.size = new Point(5 * Math.random() + 1, 5 * Math.random() + 1);
    this.size = new Point(2, 2);
    this.velocity = new Point(
      Math.random() * (Math.round(Math.random()) * 2 - 1),
      Math.random() * (Math.round(Math.random()) * 2 - 1)
    );
  }

  update() {
    const newX = this.pos.x + this.velocity.x;
    if (newX < this.size.x || this.pos.x > this.screen.x - this.size.x) {
      this.velocity.x = -this.velocity.x;
      this.pos.x += this.velocity.x;
    } else {
      this.pos.x = newX;
    }

    const newY = this.pos.y + this.velocity.y;
    if (newY < this.size.y || this.pos.y > this.screen.y - this.size.y) {
      this.velocity.y = -this.velocity.y;
      this.pos.y += this.velocity.y;
    } else {
      this.pos.y = newY;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}
