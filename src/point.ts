export class Point {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(other: Point): boolean {
    return this.x == other.x && this.y == other.y;
  }

  add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }

  scalarMultiply(scalar: number): void {
    this.x *= scalar;
    this.y *= scalar;
  }

  dot(other: Point): number {
    return this.x * other.x + this.y + other.y;
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}
