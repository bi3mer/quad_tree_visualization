import { Entity } from "./entity";
import { Point } from "./point";
import { QuadTree } from "./quadTree";

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
    // for (let i = 0; i < 20; ++i) {
    //   const e = new Entity(this.screen);
    //   this.entities.push(e);
    //   // this.qTree.insert(e);
    // }

    for (let i = 1; i < 20; ++i) {
      const e = new Entity(this.screen);
      e.pos = new Point(i * 5, i * 5 + 300);
      e.mass = 3;
      e.velocity = new Point(0, 0);
      this.entities.push(e);
    }

    // const e = new Entity(this.screen);
    // e.mass = 10;
    // e.pos = new Point(10, 40);
    // e.velocity = new Point(4, 0);
    //
    // this.entities.push(e);
  }


  public start(): void {
    let fps = 30;
    let requestTime = performance.now();
    const loop = () => {
      const currentTime = performance.now();
      fps = Math.round(1000 / (currentTime - requestTime));
      requestTime = currentTime;

      this.ctx.clearRect(0, 0, this.screen.x, this.screen.y);
      this.ctx.font = "20px Arial";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(`FPS: ${fps}`, this.screen.x - 90, this.screen.y);

      const size = this.entities.length;
      let i = 0;

      // Lazy way
      // for (i = 0; i < size; ++i) {
      //   for (let j = i + 1; j < size; ++j) {
      //     this.entities[i].collision(this.entities[j]);
      //   }
      // }

      // build quad tree way
      let qTree = new QuadTree(new Point(0, 0), this.screen);
      for (i = 0; i < size; ++i) {
        qTree.insert(this.entities[i]);
      }
      qTree.physicsUpdate();
      // console.log(qTree);
      // console.log(this.qTree..occupants.length, size);

      // update quad tree dynamically way
      // this.qTree.update();

      // this.qTree.update();
      // qTree.physicsUpdate();
      // this.entities[0].collision(this.entities[1]);


      // update entities
      for (i = 0; i < size; ++i) {
        this.entities[i].update();
      }

      // render
      for (i = 0; i < size; ++i) {
        this.entities[i].render(this.ctx);
        this.entities[i].collided = false; // lazy
      }

      qTree.render(this.ctx);
      // this.qTree.render(this.ctx);

      window.requestAnimationFrame(loop);
    }

    window.requestAnimationFrame(loop);
  }
}
