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
    if (this.occupants != null) {
      if (this.occupants.length == 4) {
        const midX = (this.min.x + this.max.x) / 2;
        const midY = (this.min.y + this.max.y) / 2;

        this.children = [
          new QuadTree(new Point(this.min.x, this.min.y), new Point(midX, midY)), // North-East
          new QuadTree(new Point(midX, this.min.y), new Point(this.max.x, midY)), // North-West
          new QuadTree(new Point(this.min.x, midY), new Point(midX, this.max.y)), // South-East
          new QuadTree(new Point(midX, midY), new Point(this.max.x, this.max.y)), // South-West
        ];

        for (let occupantId = 0; occupantId < 4; ++occupantId) {
          const e = this.occupants[occupantId];
          for (let childID = 0; childID < 4; ++childID) {
            if (this.children[childID].inBounds(e.pos)) {
              this.children[childID].insert(e);
              break;
            }
          }
        }

        this.occupants = null;
      } else {
        this.occupants.push(entity);
      }
    } else {
      for (let i = 0; i < 4; ++i) {
        if (this.children![i].inBounds(entity.pos)) {
          this.children![i].insert(entity);
        }
      }
    }
  }

  public remove(entity: Entity) {
    console.error('QuadTree.remove not implemented!');
  }

  // ERROR: size of the entity is not used
  private inBounds(pos: Point): boolean {
    return pos.x >= this.min.x && pos.x <= this.max.x && pos.y >= this.min.y && pos.y <= this.max.y;
  }
}
