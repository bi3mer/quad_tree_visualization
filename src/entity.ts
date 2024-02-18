import { Point } from "./point";
import { randomSign } from "./util";

export class Entity {
  screen: Point
  mass: number
  pos: Point
  lastPos: Point
  acceleration: Point
  collided: boolean

  constructor(screen: Point) {
    this.screen = screen;

    this.mass = Math.random() * 3 + 2;
    this.pos = new Point(
      screen.x * 0.375 * Math.random(),
      screen.y * 0.375 * Math.random()
    );

    this.lastPos = new Point(
      this.pos.x + Math.random() * randomSign(),
      this.pos.y + Math.random() * randomSign()
    );

    this.acceleration = new Point(0, 0);

    this.collided = false;
  }

  update(dt: number = 0.01) {
    this.collisionWithWall();

    const lastUpdateMove = this.pos.subtract(this.lastPos);
    const velocityDampener = 40;

    const newPos = new Point(
      this.pos.x + lastUpdateMove.x + (this.acceleration.x - lastUpdateMove.x * velocityDampener) * (dt * dt),
      this.pos.y + lastUpdateMove.y + (this.acceleration.y - lastUpdateMove.y * velocityDampener) * (dt * dt),
    );


    this.lastPos = this.pos;
    this.pos = newPos;

    this.acceleration.zero();
    // this.pos.x += this.velocity.x;
    // this.pos.y += this.velocity.y;
  }

  collision(other: Entity): void {
    const diff = new Point(other.pos.x - this.pos.x, other.pos.y - this.pos.y);
    const dist = Math.pow(diff.x, 2) + Math.pow(diff.y, 2);
    if (dist <= Math.pow(this.mass + other.mass, 2)) {
      this.collided = true;
      other.collided = true;

      // slope of line between the two circles
      const m = diff.y / diff.x;

      // length of intersection
      const l = (this.mass + other.mass) - dist;
      console.log(l);

      // update positions
      const u = 0.5 * l * m;
      this.pos.scalarAdd(u);
      other.pos.scalarSubtract(u);

      console.log(this.pos, other.pos);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.collided ? "red" : "green";
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.mass, 0, Math.PI * 2);
    ctx.fill();
  }

  private collisionWithWall(): void {
    if (this.pos.x > this.screen.x - this.mass) {
      this.pos.x = this.screen.x - this.mass;
      // this.velocity.x *= -1;
    } else if (this.pos.x < this.mass) {
      this.pos.x = this.mass;
      // this.velocity.x *= -1;
    } else if (this.pos.y > this.screen.y - this.mass) {
      this.pos.y = this.screen.y - this.mass;
      // this.velocity.y *= -1;
    } else if (this.pos.y < this.mass) {
      this.pos.y = this.mass;
      // this.velocity.y *= -1;
    }
  }
}
