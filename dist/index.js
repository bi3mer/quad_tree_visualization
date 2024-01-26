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
  add(other) {
    return new Point(this.x + other.x, this.y + other.y);
  }
  scalarMultiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  }
}

// src/entity.ts
class Entity {
  mass;
  screen;
  pos;
  velocity;
  color;
  friction;
  constructor(screen, friction = 0.998) {
    this.screen = screen;
    this.mass = Math.random() * 3 + 1;
    this.pos = new Point(screen.x * 0.375 + screen.x * Math.random() * 0.25, screen.y * 0.375 + screen.y * Math.random() * 0.25);
    this.velocity = new Point(0, 0);
    this.friction = friction;
    this.color = "green";
  }
  update() {
    const newX = this.pos.x + this.velocity.x;
    if (newX < this.mass || this.pos.x > this.screen.x - this.mass) {
      this.velocity.x = -this.velocity.x;
      this.pos.x += this.velocity.x;
    } else {
      this.pos.x = newX;
    }
    const newY = this.pos.y + this.velocity.y;
    if (newY < this.mass || this.pos.y > this.screen.y - this.mass) {
      this.velocity.y = -this.velocity.y;
      this.pos.y += this.velocity.y;
    } else {
      this.pos.y = newY;
    }
    this.velocity.scalarMultiply(this.friction);
  }
  collision(other) {
    const diff = new Point(other.pos.x - this.pos.x, other.pos.y - this.pos.y);
    const dist = Math.hypot(diff.x, diff.y);
    if (dist <= this.mass + other.mass) {
      this.color = "red";
      other.color = "red";
      const norm = new Point(diff.x / dist, diff.y / dist);
      const diffV = new Point(this.velocity.x - other.velocity.x, this.velocity.y - other.velocity.y);
      const speed = diffV.x * norm.x + diffV.y * norm.y;
      if (speed < 0) {
        return;
      }
      const J = 2 * speed / (this.mass + other.mass);
      this.velocity.x -= J * other.mass * norm.x;
      this.velocity.y -= J * other.mass * norm.y;
      other.velocity.x += J * this.mass * norm.x;
      other.velocity.x += J * this.mass * norm.y;
    }
  }
  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.mass, 0, Math.PI * 2);
    ctx.fill();
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
            if (this.children[childID].inBounds(e)) {
              this.children[childID].insert(e);
            }
          }
        }
        this.occupants = null;
      } else {
        this.occupants.push(entity);
      }
    } else {
      for (let i = 0;i < 4; ++i) {
        if (this.children[i].inBounds(entity)) {
          this.children[i].insert(entity);
        }
      }
    }
  }
  physicsUpdate() {
    if (this.occupants === null) {
      for (let i = 0;i < 4; ++i) {
        this.children[i].physicsUpdate();
      }
      return;
    }
    const size = this.occupants.length;
    for (let i = 0;i < size; ++i) {
      const e = this.occupants[i];
      for (let jj = i + 1;jj < size; ++jj) {
        e.collision(this.occupants[jj]);
      }
    }
  }
  inBounds(entity) {
    const xn = Math.max(this.min.x, Math.min(entity.pos.x, this.max.x));
    const yn = Math.max(this.min.y, Math.min(entity.pos.y, this.max.y));
    const dx = xn - entity.pos.x;
    const dy = yn - entity.pos.y;
    return Math.pow(dx, 2) + Math.pow(dy, 2) <= Math.pow(entity.mass, 2);
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
    for (let i = 0;i < 10; ++i) {
      const e2 = new Entity(this.screen);
      this.entities.push(e2);
      this.qTree.insert(e2);
    }
    const e = new Entity(this.screen, 1);
    e.mass = 30;
    e.pos = new Point(e.mass, this.screen.y / 2);
    e.velocity = new Point(10, -0.01);
    this.entities.push(e);
    this.qTree.insert(e);
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
      qTree.physicsUpdate();
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
