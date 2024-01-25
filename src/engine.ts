import { Entity } from "./entity";
import { Point } from "./point";
import { QuadTree } from "./quadTree";

// TODO: implement quad tree
// TODO: place entities into the quad tree
// TODO: when entities move, they change the tree
// TODO: visualization of quad tree with green lines
// TODO: quad tree is updated based on movement
// TODO: on collision, entities temporarily change color
// TODO: on collision, entities reflect off of eachother and their velocity changes
// TODO: handle different sized entities
// That shoudl be it

export class Engine {
  private screen: Point
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private entities: Entity[]
  private qTree: QuadTree

  constructor() {
    this.screen = new Point(720, 480);
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute('id', 'canvas');
    this.canvas.setAttribute('width', `${this.screen.x}`);
    this.canvas.setAttribute('height', `${this.screen.y}`);

    document.getElementById('canvashere')!.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.qTree = new QuadTree(new Point(0, 0), this.screen);

    this.entities = [];
    for (let i = 0; i < 50; ++i) {
      const e = new Entity(this.screen);
      this.entities.push(e);
      this.qTree.insert(e);
    }
  }

  public start(): void {
    // dt not what we want right now

    const loop = () => {
      this.ctx.clearRect(0, 0, this.screen.x, this.screen.y);

      const size = this.entities.length;
      let i = 0;
      for (; i < size; ++i) {
        this.entities[i].update();
      }

      this.ctx.fillStyle = "green";
      for (i = 0; i < size; ++i) {
        this.entities[i].render(this.ctx);
      }

      this.ctx.strokeStyle = "blue";
      // this.ctx.lineWidth = 0.5;
      this.qTree.render(this.ctx);

      window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
  }
}
