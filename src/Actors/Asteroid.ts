import { Sprite } from "pixi.js";
import Actor from "./Actor";
import { Game } from "../Game/Game";
import MovingObjectData from "../Data/MovingObjectData";
import PhysicsData from "../Data/PhysicsData";

export const AsteroidPointData = [100, 50, 20];

export class Asteroid extends Actor {
  public static readonly DEFUALT_SIZE = 50;
  public static readonly DEFUALT_SCALE = 1;
  public static readonly DEFAULT_ROTATION_RATE = 1;
  public static readonly MIN_SPEED = 0.1;
  public static readonly MAX_SPEED = 1.5;

  private _rotationRate: number;
  private _randRotDirection: number;

  constructor(lives: number, physicsData: PhysicsData) {
    super();
    this.name = "Asteroid";
    this._ready = false;
    this.data = new MovingObjectData();
    this.data.lives = lives;
    this.data.physics = physicsData;
    this._rotationRate =
      Math.random() *
        (Asteroid.DEFAULT_ROTATION_RATE * 2 - Asteroid.DEFAULT_ROTATION_RATE) +
      Asteroid.DEFAULT_ROTATION_RATE;
    const rand = Math.floor(Math.random() * 2);
    this.texture = Game.assetLoader.getTexture(`asteroid_${rand}.png`);

    const probability = Math.random();
    this._randRotDirection = probability > 0.5 ? -1 : 1;

    this.startReadyDelay(0.2);
  }

  public onUpdate = (dt) => {
    this.data.physics.velocity.x =
      this.data.physics.direction.x * this.data.physics.speed;
    this.data.physics.velocity.y =
      this.data.physics.direction.y * this.data.physics.speed;
    this.position.x += this.data.physics.velocity.x * dt;
    this.position.y += this.data.physics.velocity.y * dt;
    this.angle += this._rotationRate * this._randRotDirection * dt;
  };
}
