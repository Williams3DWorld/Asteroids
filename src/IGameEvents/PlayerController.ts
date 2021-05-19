import { Game, IGameEvents } from "../Game/Game";
import Player from "../Actors/Player";
import { Container, Texture, Sprite } from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import Bullet from "../Actors/Bullet";
import Helpers from "../Utils/Helpers";
import Actor from "../Actors/Actor";
import PlayerExplosion from "../FX/PlayerExplosion";
import MovingObjectData from "../Data/MovingObjectData";
import GUI from "./GUI";
import { VirtualButtons } from "../GUI/VirtualController";
import LaserGun from "../FX/LaserGun";

enum ButtonEvents {
  FIRE,
  THRUST,
}

export default class PlayerController extends Container implements IGameEvents {
  public static readonly SHOOT_DELAY = 200;
  public static readonly ACCELERATION_RATE = 0.1;
  public static readonly FRICTION = 0.01;
  public static readonly LASER_GUN_OFFSET = 16;

  private _laserGun: LaserGun;
  public get laserGun(): LaserGun {
    return this._laserGun;
  }

  private _mousePos: any;
  private _player: Player;
  private _thrusting: boolean;
  private _thrustFlame: Sprite;
  private _thrustTween: any;

  constructor(private game: Game) {
    super();

    this.name = "PlayerController";
    this._mousePos = { x: 0, y: 0 };
    this._thrusting = false;
    this._laserGun = new LaserGun(
      PlayerController.LASER_GUN_OFFSET,
      PlayerController.SHOOT_DELAY,
      Bullet.DEFAULT_BULLET_LIFE_TIME,
      Bullet.DEFAULT_BULLET_SPEED,
      () => Game.audioManager.play("fire")
    );
    this._player = new Player();

    this.addChild(this._player);
    this.addChild(this._laserGun);

    this.resetTransform();
    this.initialiseThruster();
    this.initialiseVirtualController();
  }

  private initialiseVirtualController = () => {
    if (Game.virtualController) {
      const control = Game.virtualController;
      this.scale.set(GUI.PORTRAIT_SCALAR);
      control.bindButtonDownEvent(VirtualButtons.BTN_THRUST, () => {
        if (this.isReady()) this.startThruster();
      });
      control.bindButtonUpEvent(VirtualButtons.BTN_THRUST, () => {
        if (this.isReady()) this.stopThruster();
      });
      control.bindButtonDownEvent(VirtualButtons.BTN_FIRE, () => {
        if (this.isReady()) this._laserGun.startShooting();
      });
      control.bindButtonUpEvent(VirtualButtons.BTN_FIRE, () => {
        if (this.isReady()) this._laserGun.stopShooting();
      });
      control.bindDialMoveEvent(() => {
        if (this.isReady()) {
          const dialAngle = control.dial.angle;
          this.angle = dialAngle;
          this._laserGun.updateLookAngle(this.rotation);
        }
      });
    }
  };

  private initialiseThruster = () => {
    this._thrustFlame = new Sprite(Texture.WHITE);
    const flame = this._thrustFlame;
    flame.anchor.set(-0.4, -0.4);
    flame.width = 8;
    flame.height = 8;
    flame.angle = 45;
    flame.visible = true;
    this.addChild(this._thrustFlame);

    const scaleTo = 0.6;
    this._thrustTween = new TWEEN.Tween(flame.scale)
      .to({ x: scaleTo, y: scaleTo }, 50)
      .yoyo(true)
      .repeat(Number.POSITIVE_INFINITY);
  };

  private startThruster = () => {
    this._thrusting = true;
    this._thrustTween.start();
    Game.audioManager.play("thrust");
  };

  private stopThruster = () => {
    this._thrusting = false;
    this._thrustTween.stop();
    Game.audioManager.stop("thrust");
  };

  private resetTransform = () => {
    this.position.x = window.innerWidth / 2;
    this.position.y = window.innerHeight / 2;
    this.angle = Game.virtualController ? Game.virtualController.dial.angle : 0;
    this._laserGun.updateLookAngle(this.rotation);
  };

  private reset = () => {
    this._thrusting = false;
    this._laserGun.setShootingState(false);

    this.resetTransform();

    this._player.reset();
  };

  public isReady = () => {
    return this._player.isReady;
  };

  public getData = () => {
    return this._player.data;
  };

  public getPlayerObject = () => {
    return this._player;
  };

  private updateLook = () => {
    const dx = this._mousePos.x - this.position.x;
    const dy = this._mousePos.y - this.position.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    this.angle = angle;
    this._laserGun.updateLookAngle(this.rotation);
  };

  private updateMovement = (dt) => {
    this._player.onUpdate(dt);

    this.x += this._player.thrust.x * dt;
    this.y += this._player.thrust.y * dt;
  };

  public updateMousePos = (e: any) => {
    if (this.isReady()) {
      this._mousePos.x = e.global.x;
      this._mousePos.y = e.global.y;
      this.updateLook();
    }
  };

  public updateMouseButtonDown = (button: number) => {
    if (this.isReady()) {
      if (button == ButtonEvents.FIRE) {
        this._laserGun.startShooting();
      } else if (ButtonEvents.THRUST) {
        this.startThruster();
      }
    }
  };

  public updateMouseButtonUp = (button: number) => {
    if (this.isReady()) {
      if (button == ButtonEvents.FIRE) {
        this._laserGun.stopShooting();
      } else if (ButtonEvents.THRUST) {
        this.stopThruster();
      }
    }
  };

  private getDirectionFromRadians = (rad: number) => {
    const dx = Math.sin(rad);
    const dy = -Math.cos(rad);
    return { x: dx, y: dy };
  };

  private updateThrusting = (dt: number) => {
    const finalDt = (Game.virtualController ? GUI.PORTRAIT_SCALAR : 1) * dt;
    const physics = this._player.data.physics;
    physics.direction = this.getDirectionFromRadians(this.rotation);

    if (this._thrusting) {
      this._player.thrust.x +=
        PlayerController.ACCELERATION_RATE * physics.direction.x * finalDt;
      this._player.thrust.y +=
        PlayerController.ACCELERATION_RATE * physics.direction.y * finalDt;
    } else {
      this._player.thrust.x -=
        PlayerController.FRICTION * this._player.thrust.x * finalDt;
      this._player.thrust.y -=
        PlayerController.FRICTION * this._player.thrust.y * finalDt;
    }

    this.updateMovement(finalDt);
  };

  public addLife = () => {
    this._player.data.lives++;
  };

  private playerHit = () => {
    this._player.data.lives--;

    if (this._player.data.lives < 1) {
      this.game.dispatchGameOver();
    }

    this._laserGun.destroyBulletProjectiles();

    this._player.setReady = false;
    this._player.visible = false;
    this.angle = 0;

    let explosion = new PlayerExplosion(() => {
      this.reset();
      this.removeChild(explosion);
      explosion = null;
    });

    this.addChild(explosion);
    this.stopThruster();
  };

  public onUpdate = (dt: number) => {
    if (this._player.visible) {
      this._laserGun.update(dt);
      this.updateThrusting(dt);
    }

    this._thrustFlame.visible = this._thrusting;
    Helpers.updateScreenWrap(this, this._player.data.physics.radius);
  };

  public onAsteroidHit = (asteroid: Actor, bullet: Actor) => {
    bullet.visible = false;
  };

  public onAsteroidHitPlayer = (asteroid: Actor) => {
    this.playerHit();
  };

  public onGameOver = () => {
    this._player.data.lives = MovingObjectData.MAX_LIVES;
    this.stopThruster();
  };

  public onLevelComplete = () => {};

  public onUfoHitPlayer = () => {
    this.playerHit();
  };

  public onPlayerHitUfo = () => {};
}
