export default class PhysicsData {
  public radius: number = 64;
  public speed: number = 0;
  public direction: any = { x: 0, y: 1 };
  public velocity: any = { x: 0, y: 0 };

  constructor(radius: number, speed: number, direction: any) {
    this.radius = radius;
    this.speed = speed;
    this.direction = direction;
    this.velocity.x = this.direction.x * speed;
    this.velocity.y = this.direction.y * speed;
  }
}
