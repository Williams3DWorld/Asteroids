import Actor from "./Actor";
import { Texture } from "pixi.js";
import MovingObjectData from "../Data/MovingObjectData";
import PhysicsData from "../Data/PhysicsData";
import { Game } from "../Game/Game";
import GUI from "../IGameEvents/GUI";
import Helpers from "../Utils/Helpers";

export default class Bullet extends Actor {
  public static readonly BULLET_WIDTH = 1;
  public static readonly BULLET_HEIGHT = 2;
  public static readonly DEFAULT_BULLET_SPEED = 8;
  public static readonly DEFAULT_BULLET_LIFE_TIME = Math.max(
    window.innerWidth,
    window.innerHeight
  );

  constructor(speed: number) {
    super();

    this.name = "Bullet";
    this.data = new MovingObjectData();
    this.data.lives = 1;

    const scalar = Game.virtualController ? GUI.PORTRAIT_SCALAR : 1;
    this.data.physics = new PhysicsData(
      Bullet.BULLET_HEIGHT * scalar,
      speed * scalar,
      {
        x: 0,
        y: -1,
      }
    );

    this.width = Bullet.BULLET_WIDTH * scalar;
    this.height = Bullet.BULLET_HEIGHT * scalar;
    this.texture = Texture.WHITE;
    this.anchor.set(0.5);

    this._ready = true;
  }

  public onUpdate = (dt) => {
    this.position.x +=
      this.data.physics.direction.x * this.data.physics.speed * dt;
    this.position.y +=
      this.data.physics.direction.y * this.data.physics.speed * dt;
  };
}
