import { Game, IGameEvents } from "../Game/Game";
import { GameSettings } from "../Config/GameSettings";
import Player from "../Actors/Player";
import { Container, Texture, Sprite } from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import Bullet from "../Actors/Bullet";
import Helpers from "../Utils/Helpers";
import Actor from "../Actors/Actor";
import PlayerExplosion from "../FX/PlayerExplosion";
import MovingObjectData from "../Data/MovingObjectData";
import GUI from "./GUI";
import { VirtualButtons, VirtualControls } from "../GUI/VirtualController";

enum ButtonEvents {
  FIRE,
  THRUST,
}

export default class PlayerController extends Container implements IGameEvents {
  public static readonly SHOOT_DELAY = 200;
  public static readonly ACCELERATION_RATE = 0.1;
  public static readonly DECCELERATION_RATE = 0.01;

  private _bullets: Array<Actor>;
  public get bullets(): Array<Actor> {
    return this._bullets;
  }

  private _mousePos: any;
  private _player: Player;
  private _acceleration: number;
  private _thrusting: boolean;
  private _shooting: boolean;
  private _shootIntervalTween: any;
  private _currentDirection: any;
  private _thrustFlame: Sprite;
  private _thrustTween: any;

  constructor(private game: Game) {
    super();

    this.name = "PlayerController";
    this._mousePos = { x: 0, y: 0 };
    this._shooting = false;
    this._thrusting = false;
    this._acceleration = 0;
    this._bullets = new Array();
    this._player = new Player();

    this.addChild(this._player);

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
        if (this.isReady()) this.startShooting();
      });
      control.bindButtonUpEvent(VirtualButtons.BTN_FIRE, () => {
        if (this.isReady()) this.stopShooting();
      });
      control.bindDialMoveEvent(() => {
        if (this.isReady()) {
          const dialAngle = control.dial.angle;
          this.angle = dialAngle;
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

  private startShooting = () => {
    this._shooting = true;
  };

  private stopShooting = () => {
    this._shooting = false;
    this._shootIntervalTween?.stop();
    this._shootIntervalTween = null;
  };

  private startThruster = () => {
    this._thrusting = true;
    this._thrustTween.start();
    //this.updateLook();
    this._currentDirection = this.getDirectionFromRadians(this.rotation);
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
  };

  private reset = () => {
    this._thrusting = false;
    this._shooting = false;
    this._acceleration = 0;

    this.resetTransform();

    this._player.reset();
  };

  public isReady = () => {
    return this._player.isReady;
  };

  public getData = () => {
    return this._player.data;
  };

  private updateLook = () => {
    const dx = this._mousePos.x - this.position.x;
    const dy = this._mousePos.y - this.position.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    this.angle = angle;
  };

  private createBullet = () => {
    const bullet = new Bullet();
    bullet.rotation = this.rotation;
    bullet.data.physics.direction.x = Math.sin(this.rotation);
    bullet.data.physics.direction.y = -Math.cos(this.rotation);
    bullet.x =
      this.x + bullet.data.physics.direction.x * Bullet.BULLET_SPAWN_OFFSET;
    bullet.y =
      this.y + bullet.data.physics.direction.y * Bullet.BULLET_SPAWN_OFFSET;
    return bullet;
  };

  private shoot = () => {
    const bullet = this.createBullet();
    this.parent.addChild(bullet);

    Helpers.timer(Bullet.BULLET_LIFE_TIME, () => {
      this._bullets[0]?.destroy();
      this._bullets.shift();
    });

    Game.audioManager.play("fire");
    this._bullets.push(bullet);
  };

  private updateMovement = (dt) => {
    this._player.onUpdate(dt);

    this.x += this._player.data.physics.velocity.x * dt;
    this.y += this._player.data.physics.velocity.y * dt;
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
        this.startShooting();
      } else if (ButtonEvents.THRUST) {
        this.startThruster();
      }
    }
  };

  public updateMouseButtonUp = (button: number) => {
    if (this.isReady()) {
      if (button == ButtonEvents.FIRE) {
        this.stopShooting();
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
    const physics = this._player.data.physics;
    physics.speed =
      this._acceleration * (Game.virtualController ? GUI.PORTRAIT_SCALAR : 1);

    if (this._thrusting) {
      physics.direction = this._currentDirection;
      if (this._acceleration < Player.MAX_SPEED)
        this._acceleration += PlayerController.ACCELERATION_RATE * dt;
      else {
        this._acceleration = Player.MAX_SPEED;
      }
    } else {
      if (this._acceleration > 0)
        this._acceleration -= PlayerController.DECCELERATION_RATE * dt;
      else this._acceleration = 0;
    }

    physics.velocity = {
      x: physics.direction.x * physics.speed,
      y: physics.direction.y * physics.speed,
    };

    this.updateMovement(dt);
  };

  private updateShooting = (dt: number) => {
    if (this._shooting) {
      if (!this._shootIntervalTween) {
        const time = { t: 0 };
        this._shootIntervalTween = new TWEEN.Tween(time)
          .onStart(() => {
            this.shoot();
          })
          .to({ t: 1 }, PlayerController.SHOOT_DELAY)
          .repeat(Number.POSITIVE_INFINITY)
          .onRepeat(() => {
            this.shoot();
          })
          .start();
      }
    }

    this._bullets.forEach((bullet) => {
      bullet.onUpdate(dt);
    });
  };

  public addLife = () => {
    this._player.data.lives++;
  };

  public onUpdate = (dt: number) => {
    if (this._player.visible) {
      this.updateShooting(dt);
      this.updateThrusting(dt);
    }

    this._thrustFlame.visible = this._thrusting;
    Helpers.updateScreenWrap(this, this._player.data.physics.radius);
  };

  public onAsteroidHit = (asteroid: Actor, bullet: Actor) => {
    bullet.visible = false;
  };

  public onPlayerHit = (asteroid: Actor) => {
    this._player.data.lives--;

    if (this._player.data.lives < 1) {
      this.game.dispatchGameOver();
    }

    this._shootIntervalTween?.stop();
    this._shootIntervalTween = null;

    this._bullets.forEach((bullet) => bullet.destroy());
    this._bullets = [];
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

  public onGameOver = () => {
    this._player.data.lives = MovingObjectData.MAX_LIVES;
    this.stopThruster();
  };

  public onLevelComplete = () => {};
}
