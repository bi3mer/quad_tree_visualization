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
    this.ctx.fillStyle = "green";
    this.ctx.lineWidth = 0.2;
    this.ctx.strokeStyle = "white";

    this.qTree = new QuadTree(new Point(0, 0), this.screen);

    this.entities = [];
    for (let i = 0; i < 100; ++i) {
      const e = new Entity(this.screen);
      this.entities.push(e);
      this.qTree.insert(e);
    }

    const e = new Entity(this.screen);
    e.mass = 10;
    e.pos = new Point(e.mass, this.screen.y / 2);
    e.velocity = new Point(10, 0);

    this.entities.push(e);
    this.qTree.insert(e);
  }

  public start(): void {
    const loop = () => {
      this.ctx.clearRect(0, 0, this.screen.x, this.screen.y);

      const size = this.entities.length;
      let i = 0;
      let qTree = new QuadTree(new Point(0, 0), this.screen);
      for (; i < size; ++i) {
        this.entities[i].update();
        qTree.insert(this.entities[i]);
      }

      // this.qTree.update();
      qTree.physicsUpdate();
      // this.entities[0].collision(this.entities[1]);

      for (i = 0; i < size; ++i) {
        this.entities[i].render(this.ctx);
      }

      qTree.render(this.ctx);
      // this.qTree.render(this.ctx);

      window.requestAnimationFrame(loop);
    }

    window.requestAnimationFrame(loop);
  }
}
