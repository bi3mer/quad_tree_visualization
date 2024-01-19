class Engine {
  public start(): void {
    // TODO: set up canvas
    // TODO: create entities and render them
    // TODO: entities move around the canvas
    // TODO: implement quad tree
    // TODO: place entities into the quad tree
    // TODO: visualization of quad tree with green lines
    // TODO: quad tree is updated based on movement
    // TODO: on collision, entities change color from gree to ren
    // That shoudl be it

    const loop = () => {
      this.update();
      this.render();

      window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
  }

  private update(): void {

  }

  private render(): void {

  }
}
