// Semi-implicit fixed-step springs. Runtime targets come from pointer proximity
// and assembly motion; no recorded animation is played by this solver.
export class GuideSprings {
  constructor(count) {
    this.count=count;
    this.position=new Float32Array(count*3);
    this.velocity=new Float32Array(count*3);
    this.target=new Float32Array(count*3);
    this.accumulator=0;
  }
  advance(seconds) {
    this.accumulator+=Math.min(Math.max(seconds,0),.05);
    const h=1/120,stiffness=75,damping=11;
    while(this.accumulator>=h) {
      for(let i=0;i<this.position.length;i++) {
        const goal=Math.max(-.38,Math.min(.38,this.target[i]));
        this.velocity[i]+=(stiffness*(goal-this.position[i])-damping*this.velocity[i])*h;
        this.position[i]+=this.velocity[i]*h;
      }
      this.accumulator-=h;
    }
  }
}
