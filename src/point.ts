export class Point {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  zero(): void {
    this.x = 0;
    this.y = 0;
  }

  equals(other: Point): boolean {
    return this.x == other.x && this.y == other.y;
  }

  add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }

  subtract(other: Point): Point {
    return new Point(this.x - other.x, this.y - other.y);
  }

  scalarAdd(n: number): void {
    this.x += n;
    this.y += n;
  }

  scalarSubtract(n: number): void {
    this.x -= n;
    this.y -= n;
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
