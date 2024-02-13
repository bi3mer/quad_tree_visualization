import { EndOfLineState } from "typescript";
import { Entity } from "./entity";
import { Point } from "./point";
import { clamp } from "./util";

const MAX_DETPH = 5;

export class QuadTree {
  subTrees: null | [QuadTree, QuadTree, QuadTree, QuadTree]
  occupants: null | Entity[]
  min: Point
  max: Point
  depth: number

  constructor(min: Point, max: Point, depth: number = 0) {
    this.subTrees = null;
    this.occupants = [];

    this.min = min;
    this.max = max;

    this.depth = depth;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath(); // rect was super slow for some reason
    ctx.moveTo(this.min.x, this.min.y);
    ctx.lineTo(this.max.x, this.min.y);
    ctx.lineTo(this.max.x, this.max.y);
    ctx.lineTo(this.min.x, this.max.y);
    ctx.lineTo(this.min.x, this.min.y);
    ctx.closePath();
    ctx.stroke();

    if (this.subTrees !== null) {
      for (let i = 0; i < 4; ++i) {
        this.subTrees[i].render(ctx);
      }
    }
  }

  public insert(entity: Entity) {
    // Entity must be in bounds of the tree
    if (!this.inBounds(entity)) {
      return;
    }

    // This layer had too many entities, insert into subtrees
    if (this.occupants === null) {
      this.addToSubTrees(entity);
      return;
    }

    // Layer has space for another entity or max depth of the quad tree reached
    if (this.occupants.length < 4 || this.depth >= MAX_DETPH) {
      this.occupants.push(entity);
      return
    }

    // Layer would be overfull with the new entity. Create sub-trees and add 
    // occupants and new entityt to those sub-trees
    this.createSubTrees();
    this.addToSubTrees(entity);

    this.occupants = null;
  }

  public physicsUpdate(): void {
    if (this.occupants === null) {
      this.subTrees![0].physicsUpdate(); // sue me!!!
      this.subTrees![1].physicsUpdate();
      this.subTrees![2].physicsUpdate();
      this.subTrees![3].physicsUpdate();

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

  public update(): void {
    // 1. Find all entities that no longer fit in the tree and insert them 
    // into the tree, trying at each layer of the tree.
    const leftTree = this.moveOutOfBoundsEntities();
    const size = leftTree.length;
    for (let i = 0; i < size; ++i) {
      this.insert(leftTree[i]);
    }

    // 2. Clean up the tree so that we don't leave behind empty trees
    this.cleanUpTreesFromMovingEntities();
  }

  private moveOutOfBoundsEntities(): Entity[] {
    let leftTree: Entity[] = [];

    if (this.occupants === null) {
      // get all entities that aren't in the correct space in the tree
      leftTree = leftTree
        .concat(this.subTrees![0].moveOutOfBoundsEntities())
        .concat(this.subTrees![1].moveOutOfBoundsEntities())
        .concat(this.subTrees![2].moveOutOfBoundsEntities())
        .concat(this.subTrees![3].moveOutOfBoundsEntities()); // felt very rust-like

      // if we can, add re-insert them becaues they fit at this point in the tree
      for (let i = 0; i < leftTree.length; ++i) {
        const e = leftTree[i];
        if (this.inBounds(e)) {
          this.insert(e);
          leftTree.splice(i, 1);
          --i;
        }
      }

      // Otherwise, move them up to the next layer of trees
      return leftTree;
    }

    for (let i = 0; i < this.occupants.length; ++i) {
      const e = this.occupants[i];
      if (!this.inBounds(e)) {
        leftTree.push(e);
        this.occupants.splice(i, 1);
        --i;
      }
    }


    return leftTree;
  }

  private cleanUpTreesFromMovingEntities(): void {
    // If this is a leaf, nothing to do.
    if (this.subTrees === null) {
      return;
    }

    // Otherwise, we need to check need to first recurse all the way to the bottom 
    // of the tree.
    let i = 0;
    for (; i < 4; ++i) {
      this.subTrees[i].cleanUpTreesFromMovingEntities();
    }

    // Now that the sub trees below us have been cleaned, we can check to see if 
    // this tree needs to be cleaned. We do this by checking if the number of 
    // occupants below are less than or equal to 4
    let occupants = 0;
    for (i = 0; i < 4; ++i) {
      // Subtree existing below means that there are too many occupants
      if (this.subTrees[i].subTrees !== null) {
        occupants += 5;
        break;
      }

      occupants += this.subTrees[i].occupants!.length;
    }

    if (occupants <= 4) {
      // We can deconstruct the trees below 
      this.occupants = [];
      for (i = 0; i < 4; ++i) {
        const occupants = this.subTrees[i].occupants!;
        const size = occupants.length;
        for (let jj = 0; jj < size; ++jj) {
          this.occupants.push(occupants[jj]);
        }
      }

      this.subTrees = null;
    }
  }

  private addToSubTrees(entity: Entity) {
    let inBounds = false;
    for (let i = 0; i < 4; ++i) {
      inBounds ||= this.subTrees![i].inBounds(entity);
    }
    if (!inBounds && this.depth >= 1) {
      console.log('oh no');
      for (let i = 0; i < 4; ++i) {
        inBounds ||= this.subTrees![i].inBounds(entity);
      }
    }
    this.subTrees![0].insert(entity); // sue me!
    this.subTrees![1].insert(entity);
    this.subTrees![2].insert(entity);
    this.subTrees![3].insert(entity);
  }

  private createSubTrees(): void {
    const newDepth = this.depth + 1;
    const midX = (this.min.x + this.max.x) / 2;
    const midY = (this.min.y + this.max.y) / 2;

    this.subTrees = [
      new QuadTree(new Point(midX, this.min.y), new Point(this.max.x, midY), newDepth), // North-East
      new QuadTree(new Point(this.min.x, this.min.y), new Point(midX, midY), newDepth), // North-West
      new QuadTree(new Point(midX, midY), new Point(this.max.x, this.max.y), newDepth), // South-East
      new QuadTree(new Point(this.min.x, midY), new Point(midX, this.max.y), newDepth), // South-West
    ];

    this.addToSubTrees(this.occupants![0]); // sue me!!
    this.addToSubTrees(this.occupants![1]);
    this.addToSubTrees(this.occupants![2]);
    this.addToSubTrees(this.occupants![3]);
  }


  private inBounds(entity: Entity): boolean {
    const cx = entity.pos.x;
    const cy = entity.pos.y;
    const r = entity.mass;

    const dx = cx - clamp(cx, this.min.x, this.max.x);
    const dy = cy - clamp(cy, this.min.y, this.max.y);

    return dx * dx + dy * dy <= r * r;
  }
}
