import Actor from "./Actor";
import { Texture } from "pixi.js";
import MovingObjectData from "../Data/MovingObjectData";
import PhysicsData from "../Data/PhysicsData";
import { Game } from "../Game/Game";
import GUI from "../IGameEvents/GUI";
import Helpers from "../Utils/Helpers";

export default class Bullet extends Actor {
  public static readonly BULLET_WIDTH = 1;
  public static readonly BULLET_HEIGHT = 3;
  public static readonly BULLET_SPEED = 8;
  public static readonly BULLET_LIFE_TIME =
    2000 * (Helpers.isMobile() ? GUI.PORTRAIT_SCALAR : 1);
  public static readonly BULLET_SPAWN_OFFSET = 16;

  constructor() {
    super();

    this.name = "Bullet";
    this.data = new MovingObjectData();
    this.data.lives = 1;

    const scalar = Game.virtualController ? GUI.PORTRAIT_SCALAR : 1;
    this.data.physics = new PhysicsData(
      Bullet.BULLET_HEIGHT,
      Bullet.BULLET_SPEED * scalar,
      {
        x: 0,
        y: 1,
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
