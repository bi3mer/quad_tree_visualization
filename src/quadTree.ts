import { EndOfLineState } from "typescript";
import { Entity } from "./entity";
import { Point } from "./point";

export class QuadTree {
  children: null | [QuadTree, QuadTree, QuadTree, QuadTree]
  occupants: null | Entity[]
  min: Point
  max: Point

  constructor(min: Point, max: Point) {
    this.children = null;
    this.occupants = [];

    this.min = min;
    this.max = max;
  }

  public insert(entity: Entity) {
    // This layer is already filled, try insert into subtrees
    if (this.occupants === null) {
      for (let i = 0; i < 4; ++i) {
        if (this.children![i].inBounds(entity)) {
          this.children![i].insert(entity);
        }
      }
      return;
    }

    // Layer is now filled, subdivide
    if (this.occupants.length === 4) {
      const midX = (this.min.x + this.max.x) / 2;
      const midY = (this.min.y + this.max.y) / 2;

      this.children = [
        new QuadTree(new Point(midX, this.min.y), new Point(this.max.x, midY)), // North-East
        new QuadTree(new Point(this.min.x, this.min.y), new Point(midX, midY)), // North-West
        new QuadTree(new Point(midX, midY), new Point(this.max.x, this.max.y)), // South-East
        new QuadTree(new Point(this.min.x, midY), new Point(midX, this.max.y)), // South-West
      ];

      for (let occupantId = 0; occupantId < 4; ++occupantId) {
        const e = this.occupants[occupantId];
        for (let childID = 0; childID < 4; ++childID) {
          if (this.children[childID].inBounds(e)) {
            this.children[childID].insert(e);
          }
        }
      }

      this.occupants = null;
      this.insert(entity);
      return;
    }

    // layer not full, push and move on
    this.occupants.push(entity);
  }

  public physicsUpdate(): void {
    if (this.occupants === null) {
      this.children![0].physicsUpdate(); // sue me
      this.children![1].physicsUpdate();
      this.children![2].physicsUpdate();
      this.children![3].physicsUpdate();

      return;
    }

    const size = this.occupants!.length;
    for (let i = 0; i < size; ++i) {
      const e = this.occupants![i];
      for (let jj = i + 1; jj < size; ++jj) {
        e.collision(this.occupants![jj]);
      }
    }
  }

  private inBounds(entity: Entity): boolean {
    // const cx = entity.pos.x;
    // const cy = entity.pos.y;
    let cx = entity.pos.x;
    let cy = entity.pos.y;
    const r = entity.mass;

    if (cx < this.min.x) {
      cx = this.min.x;
    } else if (cx > this.max.x) {
      cx = this.max.x;
    }

    if (cy < this.min.y) {
      cy = this.min.y;
    } else if (cy > this.max.x) {
      cy = this.max.y;
    }

    const dx = cx - entity.pos.x;
    const dy = cy - entity.pos.y;

    return dx * dx + dy * dy <= r * r;
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath(); // rect was super slow for some reason
    ctx.moveTo(this.min.x, this.min.y);
    ctx.lineTo(this.max.x, this.min.y);
    ctx.lineTo(this.max.x, this.max.y);
    ctx.lineTo(this.min.x, this.max.y);
    ctx.lineTo(this.min.x, this.min.y);
    ctx.closePath();
    ctx.stroke();

    if (this.children !== null) {
      for (let i = 0; i < 4; ++i) {
        this.children[i].render(ctx);
      }
    }
  }
}
