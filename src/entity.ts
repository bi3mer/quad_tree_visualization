import { Point } from "./point";

export class Entity {
  screen: Point
  pos: Point
  size: Point
  velocity: Point

  constructor(screen: Point) {
    this.screen = screen;
    this.pos = new Point(screen.x * Math.random() * 0.25, screen.y * Math.random() * 0.25);
    // this.size = new Point(5 * Math.random() + 1, 5 * Math.random() + 1);
    this.size = new Point(1, 1);
    this.velocity = new Point(
      Math.random() * (Math.round(Math.random()) * 2 - 1),
      Math.random() * (Math.round(Math.random()) * 2 - 1)
    );
  }

  update() {
    this.pos.x = this.pos.x + this.velocity.x;
    this.pos.y = this.pos.y + this.velocity.y;

    if (this.pos.x > this.screen.x) {
      this.pos.x = 0.01;
    } else if (this.pos.x < 0) {
      this.pos.x = this.screen.x - 0.01;
    }

    if (this.pos.y > this.screen.y) {
      this.pos.y = 0.01;
    } else if (this.pos.y < 0) {
      this.pos.y = this.screen.y - 0.01;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}
