import Actor from "./Actor";
import { Game } from "../Game/Game";
import MovingObjectData from "../Data/MovingObjectData";
import PhysicsData from "../Data/PhysicsData";
import * as TWEEN from "@tweenjs/tween.js";
import Helpers from "../Utils/Helpers";
import GUI from "../IGameEvents/GUI";
import LaserGun from "../FX/LaserGun";
import PlayerController from "../IGameEvents/PlayerController";
import Bullet from "./Bullet";

export const UFOPointData = [200, 1000];

export default class UFO extends Actor {
  public static readonly DEFUALT_SIZE: number = 40;
  public static readonly DEFAULT_SPEED: number = 2.4;
  public static readonly MAX_TRAVEL_DURATION: number = window.innerHeight;
  public static readonly MIN_TRAVEL_DURATION: number =
    UFO.MAX_TRAVEL_DURATION * 0.1;
  public static readonly MOVE_Y_DELAY: number = 1800;
  public static readonly LASER_GUN_OFFSET: number = -28;
  public static readonly SHOOT_DELAY: number = 1000;
  public static readonly DEFAULT_AIM_RADIAL_THRESHOLD: number = 128;

  private _travelDurationY: number;
  private _dirY: number;
  private _aimThreshold: number;

  private _iqLevel: number;
  public get iqLevel(): number {
    return this._iqLevel;
  }

  private _laserGun: LaserGun;
  public get laserGun(): LaserGun {
    return this._laserGun;
  }

  constructor(private player: PlayerController, iqLevel: number) {
    super();

    this.name = "UFO";
    this.data = new MovingObjectData();
    this.data.lives = MovingObjectData.MAX_LIVES;
    const scalar = Game.virtualController ? GUI.PORTRAIT_SCALAR : 1;
    this.data.physics = new PhysicsData(
      UFO.DEFUALT_SIZE * scalar,
      UFO.DEFAULT_SPEED,
      {
        x: 1,
        y: 0,
      }
    );
    this.texture = Game.assetLoader.getTexture(`ufo.png`);
    this.scale.set((1 / iqLevel) * scalar);
    this._iqLevel = iqLevel;
    this._travelDurationY = 0;
    this._dirY = 1;
    this._aimThreshold = UFO.DEFAULT_AIM_RADIAL_THRESHOLD / iqLevel;

    this._laserGun = new LaserGun(
      0,
      UFO.SHOOT_DELAY / this._iqLevel,
      Bullet.DEFAULT_BULLET_LIFE_TIME * 2,
      Bullet.DEFAULT_BULLET_SPEED * 0.7,
      () => {}
    );
    this.addChild(this._laserGun);
    this._laserGun.startShooting();

    this.randomisePath();
    this.generateNewPath();

    this._ready = true;
  }

  private randomisePath = () => {
    this._travelDurationY =
      Math.random() * (UFO.MAX_TRAVEL_DURATION - UFO.MIN_TRAVEL_DURATION) +
      UFO.MIN_TRAVEL_DURATION;
    this._dirY = Math.random() > 0.5 ? 1 : -1;
  };

  private generateNewPath = () => {
    const time = { t: 0 };
    let travelStraight = false;
    new TWEEN.Tween(time)
      .to({ t: 1 }, this._travelDurationY)
      .onStart(() => {
        this.data.physics.direction.y = this._dirY;
      })
      .start()
      .repeat(Number.POSITIVE_INFINITY)
      .repeatDelay(UFO.MOVE_Y_DELAY)
      .delay(UFO.MOVE_Y_DELAY)
      .onRepeat(() => {
        this.randomisePath();
        travelStraight = !travelStraight;
        this.data.physics.direction.y = travelStraight ? 0 : this._dirY;
      });
  };

  public stopShooting = () => {
    this._laserGun.stopShooting();
    this._laserGun.destroyBulletProjectiles();
  };

  public startShooting = () => {
    this._laserGun.startShooting();
  };

  public onUpdate = (dt) => {
    const finalDt = dt * (Game.virtualController ? GUI.PORTRAIT_SCALAR : 1);

    const velocity = this.data.physics.velocity;
    const direction = this.data.physics.direction;
    const speed = this.data.physics.speed;

    velocity.x = direction.x * speed;
    velocity.y = direction.y * speed;

    this.x += velocity.x * finalDt;
    this.y += velocity.y * finalDt;

    let targetPos = { x: this.player.x, y: this.player.y };
    const aimThresholdX = {
      min: this.player.x - this._aimThreshold,
      max: this.player.x + this._aimThreshold,
    };
    const aimThresholdY = {
      min: this.player.y - this._aimThreshold,
      max: this.player.y + this._aimThreshold,
    };
    targetPos = {
      x:
        Math.random() * (aimThresholdX.max - aimThresholdX.min) +
        aimThresholdX.min,
      y:
        Math.random() * (aimThresholdY.max - aimThresholdY.min) +
        aimThresholdY.min,
    };
    const lookVec = { x: targetPos.x - this.x, y: targetPos.y - this.y };
    const lookAngle: number =
      Math.atan2(lookVec.y, lookVec.x) + (90 * Math.PI) / 180;

    this._laserGun?.updateLookAngle(lookAngle);
    this._laserGun?.update(dt);

    Helpers.updateScreenWrap(this, this.data.physics.radius);
  };
}
