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
          break;
        }
      }
    }
  }

  public update() {
    // each update call should return a list of entities and then try to insert. If Insert fails,
    // it returns that entity and any other entity up the list. So we can heavily traversing the
    // tree each time. Also, start with the stupid version then implement the smarter one I just
    // described.
    const entities = this.__update();
    const size = entities.length;
    for (let i = 0; i < size; ++i) {
      this.insert(entities[i]);
    }
  }

  private __update(): Entity[] {
    let outOfBoundEntitites: Entity[] = [];

    if (this.children === null) {
      for (let i = 0; i < this.occupants!.length; ++i) {
        const e = this.occupants![i];
        if (!this.inBounds(e.pos)) {
          outOfBoundEntitites.push(e);
          this.occupants!.splice(i);
          --i;
        }
      }

      return outOfBoundEntitites;
    }

    for (let i = 0; i < 4; ++i) {
      let inBounds = this.children![i].__update(); // recurse down the QuadTree

      for (let jj = 0; jj < inBounds.length; ++jj) {
        if (!this.inBounds(inBounds[jj].pos)) {
          outOfBoundEntitites.push(inBounds[jj]);

          inBounds.splice(jj);
          --jj;
        }
      }
    }

    // check length of children. If less than or equal to 4, delete them and just
    // use this instead
    let leafs = 0;
    for (let i = 0; i < 4; ++i) {
      if (this.children![i].children !== null) {
        leafs = 5;
        break;
      } else {
        leafs += this.children![i].occupants!.length;
      }
    }

    // if (leafs >) {
    //
    // }

    return outOfBoundEntitites;
  }

  // ERROR: size of the entity is not used
  private inBounds(pos: Point): boolean {
    return pos.x >= this.min.x && pos.x <= this.max.x && pos.y >= this.min.y && pos.y <= this.max.y;
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
