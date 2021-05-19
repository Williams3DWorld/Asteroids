import Actor from "./Actor";
import { Game } from "../Game/Game";
import MovingObjectData from "../Data/MovingObjectData";
import PhysicsData from "../Data/PhysicsData";
import * as TWEEN from "@tweenjs/tween.js";
import Helpers from "../Utils/Helpers";

export default class Player extends Actor {
  public static readonly DEFUALT_SIZE = 32;
  public static readonly MAX_SPEED = 3;
  public static readonly SPAWN_DELAY = 1;

  public thrust: any;

  constructor() {
    super();

    this.name = "Player";
    this.thrust = { x: 0, y: 0 };
    this.data = new MovingObjectData();
    this.data.lives = MovingObjectData.MAX_LIVES;
    this.data.physics = new PhysicsData(Player.DEFUALT_SIZE, 0, { x: 0, y: 1 });
    this.texture = Game.assetLoader.getTexture(`space_shuttle.png`);

    this._ready = true;
  }

  public reset = () => {
    this.visible = false;
    this.thrust.x = 0;
    this.thrust.y = 0;
    Helpers.timer(Player.SPAWN_DELAY * 1000, () => {
      this.visible = true;
      this._ready = true;
    });
  };

  public onUpdate = (dt) => {};
}
