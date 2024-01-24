// src/point.ts
class Point {
  x;
  y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  equals(other) {
    return this.x == other.x && this.y == other.y;
  }
}

// src/entity.ts
class Entity {
  screen;
  pos;
  size;
  velocity;
  constructor(screen) {
    this.screen = screen;
    this.pos = new Point(screen.x * Math.random() * 0.25, screen.y * Math.random() * 0.25);
    this.size = new Point(1, 1);
    this.velocity = new Point(Math.random() * (Math.round(Math.random()) * 2 - 1), Math.random() * (Math.round(Math.random()) * 2 - 1));
  }
  update() {
    this.pos.x = this.pos.x + this.velocity.x;
    this.pos.y = this.pos.y + this.velocity.y;
    if (this.pos.x > this.screen.x) {
      this.pos.x = 0.01;
    } else if (this.pos.x < 0) {
      this.pos.x = this.screen.x - 0.01;
    }
    if (this.pos.y > this.screen.y) {
      this.pos.y = 0.01;
    } else if (this.pos.y < 0) {
      this.pos.y = this.screen.y - 0.01;
    }
  }
  render(ctx) {
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}

// src/engine.ts
class Engine {
  screen;
  canvas;
  ctx;
  entities;
  constructor() {
    this.screen = new Point(720, 480);
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("id", "canvas");
    this.canvas.setAttribute("width", `${this.screen.x}`);
    this.canvas.setAttribute("height", `${this.screen.y}`);
    document.getElementById("canvashere").appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.entities = [];
    for (let i = 0;i < 50; ++i) {
      this.entities.push(new Entity(this.screen));
    }
  }
  start() {
    const loop = () => {
      this.ctx.clearRect(0, 0, this.screen.x, this.screen.y);
      const size = this.entities.length;
      let i = 0;
      for (;i < size; ++i) {
        this.entities[i].update();
      }
      this.ctx.fillStyle = "green";
      for (i = 0;i < size; ++i) {
        this.entities[i].render(this.ctx);
      }
      window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);
  }
}

// src/index.ts
document.body.onload = () => {
  const engine2 = new Engine;
  engine2.start();
};
