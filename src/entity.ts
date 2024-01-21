import { Point } from "./point";

export class Entity {
  screen: Point
  pos: Point
  size: Point
  velocity: Point

  constructor(screen: Point) {
    this.screen = screen;
    this.pos = new Point(screen.x * Math.random(), screen.y * Math.random());
    this.size = new Point(20 * Math.random(), 20 * Math.random());
    this.velocity = new Point(Math.random(), Math.random());
  }

  update(dt: number) {
    this.pos.x = (this.pos.x + this.velocity.x * dt) % this.screen.x;
    this.pos.y = (this.pos.y + this.velocity.y * dt) % this.screen.y;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}
