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
    this.size = new Point(2, 2);
    this.velocity = new Point(Math.random() * (Math.round(Math.random()) * 2 - 1), Math.random() * (Math.round(Math.random()) * 2 - 1));
  }
  update() {
    const newX = this.pos.x + this.velocity.x;
    if (newX < this.size.x || this.pos.x > this.screen.x - this.size.x) {
      this.velocity.x = -this.velocity.x;
      this.pos.x += this.velocity.x;
    } else {
      this.pos.x = newX;
    }
    const newY = this.pos.y + this.velocity.y;
    if (newY < this.size.y || this.pos.y > this.screen.y - this.size.y) {
      this.velocity.y = -this.velocity.y;
      this.pos.y += this.velocity.y;
    } else {
      this.pos.y = newY;
    }
  }
  render(ctx) {
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}

// src/quadTree.ts
class QuadTree {
  children;
  occupants;
  min;
  max;
  constructor(min, max) {
    this.children = null;
    this.occupants = [];
    this.min = min;
    this.max = max;
  }
  insert(entity) {
    if (this.occupants != null) {
      if (this.occupants.length == 4) {
        const midX = (this.min.x + this.max.x) / 2;
        const midY = (this.min.y + this.max.y) / 2;
        this.children = [
          new QuadTree(new Point(this.min.x, this.min.y), new Point(midX, midY)),
          new QuadTree(new Point(midX, this.min.y), new Point(this.max.x, midY)),
          new QuadTree(new Point(this.min.x, midY), new Point(midX, this.max.y)),
          new QuadTree(new Point(midX, midY), new Point(this.max.x, this.max.y))
        ];
        for (let occupantId = 0;occupantId < 4; ++occupantId) {
          const e = this.occupants[occupantId];
          for (let childID = 0;childID < 4; ++childID) {
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
      for (let i = 0;i < 4; ++i) {
        if (this.children[i].inBounds(entity.pos)) {
          this.children[i].insert(entity);
          break;
        }
      }
    }
  }
  update() {
    const entities = this.__update();
    const size = entities.length;
    for (let i = 0;i < size; ++i) {
      this.insert(entities[i]);
    }
  }
  __update() {
    let outOfBoundEntitites = [];
    if (this.children === null) {
      for (let i = 0;i < this.occupants.length; ++i) {
        const e = this.occupants[i];
        if (!this.inBounds(e.pos)) {
          outOfBoundEntitites.push(e);
          this.occupants.splice(i);
          --i;
        }
      }
      return outOfBoundEntitites;
    }
    for (let i = 0;i < 4; ++i) {
      let inBounds = this.children[i].__update();
      for (let jj = 0;jj < inBounds.length; ++jj) {
        if (!this.inBounds(inBounds[jj].pos)) {
          outOfBoundEntitites.push(inBounds[jj]);
          inBounds.splice(jj);
          --jj;
        }
      }
    }
    let leafs = 0;
    for (let i = 0;i < 4; ++i) {
      if (this.children[i].children !== null) {
        leafs = 5;
        break;
      } else {
        leafs += this.children[i].occupants.length;
      }
    }
    return outOfBoundEntitites;
  }
  inBounds(pos) {
    return pos.x >= this.min.x && pos.x <= this.max.x && pos.y >= this.min.y && pos.y <= this.max.y;
  }
  render(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.min.x, this.min.y);
    ctx.lineTo(this.max.x, this.min.y);
    ctx.lineTo(this.max.x, this.max.y);
    ctx.lineTo(this.min.x, this.max.y);
    ctx.lineTo(this.min.x, this.min.y);
    ctx.closePath();
    ctx.stroke();
    if (this.children !== null) {
      for (let i = 0;i < 4; ++i) {
        this.children[i].render(ctx);
      }
    }
  }
}

// src/engine.ts
class Engine {
  screen;
  canvas;
  ctx;
  entities;
  qTree;
  constructor() {
    this.screen = new Point(720, 480);
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("id", "canvas");
    this.canvas.setAttribute("width", `${this.screen.x}`);
    this.canvas.setAttribute("height", `${this.screen.y}`);
    document.getElementById("canvashere").appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "green";
    this.ctx.lineWidth = 0.2;
    this.ctx.strokeStyle = "white";
    this.qTree = new QuadTree(new Point(0, 0), this.screen);
    this.entities = [];
    for (let i = 0;i < 20; ++i) {
      const e = new Entity(this.screen);
      this.entities.push(e);
      this.qTree.insert(e);
    }
  }
  start() {
    const loop = () => {
      this.ctx.clearRect(0, 0, this.screen.x, this.screen.y);
      const size = this.entities.length;
      let i = 0;
      let qTree = new QuadTree(new Point(0, 0), this.screen);
      for (;i < size; ++i) {
        this.entities[i].update();
        qTree.insert(this.entities[i]);
      }
      for (i = 0;i < size; ++i) {
        this.entities[i].render(this.ctx);
      }
      qTree.render(this.ctx);
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
