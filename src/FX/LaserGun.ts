import { Container } from "@pixi/display";
import Actor from "../Actors/Actor";
import Bullet from "../Actors/Bullet";
import Helpers from "../Utils/Helpers";
import * as TWEEN from "@tweenjs/tween.js";
import { Sprite } from "@pixi/sprite";
import { Game } from "../Game/Game";
import { Texture } from "@pixi/core";

export default class LaserGun extends Container {
  private _currentLookAngle: any;
  private _shooting: boolean;
  private _shootIntervalTween: any;
  private _shootDelay: number;
  private _offset: number;
  private _bulletLifeTime: number;
  private _bulletSpeed: number;

  private _onShootCallback: () => any;

  private _bullets: Array<Actor>;
  public get bullets(): Array<Actor> {
    return this._bullets;
  }

  constructor(
    offsetY: number,
    shootDelay: number,
    bulletLifeTime: number,
    bulletSpeed: number,
    onShootCallback: () => any
  ) {
    super();

    this.name = "LaserGun";
    this._offset = offsetY;
    this._shooting = false;
    this._shootDelay = shootDelay;
    this._bulletLifeTime = bulletLifeTime;
    this._bulletSpeed = bulletSpeed;
    this._currentLookAngle = { x: 0, y: 1 };
    this._bullets = new Array();
    this._onShootCallback = onShootCallback;
  }

  public setShootingState = (value: boolean) => {
    this._shooting = value;
  };

  public startShooting = () => {
    this._shooting = true;
  };

  public stopShooting = () => {
    this._shooting = false;
    this._shootIntervalTween?.stop();
    this._shootIntervalTween = null;
  };

  public destroyBulletProjectiles = () => {
    this._shootIntervalTween?.stop();
    this._shootIntervalTween = null;
    this._bullets.forEach((bullet) => bullet.destroy());
    this._bullets = [];
  };

  public updateLookAngle = (angle: number) => {
    this._currentLookAngle = angle;
  };

  private createBullet = () => {
    const bullet = new Bullet(this._bulletSpeed);
    const bulletDir = bullet.data.physics.direction;
    bulletDir.x = Math.sin(this._currentLookAngle);
    bulletDir.y = -Math.cos(this._currentLookAngle);
    bullet.position.x = this.parent.position.x + bulletDir.x * this._offset;
    bullet.position.y = this.parent.position.y + bulletDir.y * this._offset;
    bullet.rotation = this._currentLookAngle;
    return bullet;
  };

  private shoot = () => {
    const bullet = this.createBullet();
    this.parent.parent.addChild(bullet);

    Helpers.timer(this._bulletLifeTime, () => {
      this._bullets[0]?.destroy();
      this._bullets.shift();
    });

    this._bullets.push(bullet);
    this._onShootCallback();
  };

  public updateShooting = (dt: number) => {
    if (this._shooting) {
      if (!this._shootIntervalTween) {
        const time = { t: 0 };
        this._shootIntervalTween = new TWEEN.Tween(time)
          .onStart(() => {
            this.shoot();
          })
          .to({ t: 1 }, this._shootDelay)
          .repeat(Number.POSITIVE_INFINITY)
          .onRepeat(() => {
            this.shoot();
          })
          .start();
      }
    }

    this._bullets.forEach((bullet) => {
      bullet.onUpdate(dt);
      Helpers.updateScreenWrap(bullet, bullet.data.physics.radius);
    });
  };

  public update = (dt) => {
    this.updateShooting(dt);
  };
}
