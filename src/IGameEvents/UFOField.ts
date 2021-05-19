import { Container } from "pixi.js";
import Actor from "../Actors/Actor";
import AsteroidExplosion from "../FX/AsteroidExplosion";
import { Game, IGameEvents } from "../Game/Game";
import UFO from "../Actors/UFO";
import * as TWEEN from "@tweenjs/tween.js";
import PlayerController from "./PlayerController";

export default class UFOField extends Container implements IGameEvents {
  public static readonly MAX_SPAWN_DELAY = 48 * 1000;
  public static readonly MIN_SPAWN_DELAY = 8 * 1000;
  public static readonly DEFAULT_NUM_ASTEROIDS = 1;

  private _spawmDelay: number;
  private _spawnTimer: any;

  private _ufo: UFO;
  public get ufo(): UFO {
    return this._ufo;
  }

  constructor(private game: Game, private player: PlayerController) {
    super();
    this.name = "UFOField";
    this.queueSpawn();
  }

  public queueSpawn = () => {
    if (this.game.level > 2) {
      const timer = { t: 0 };
      const randSpawnDelay =
        Math.random() * (UFOField.MAX_SPAWN_DELAY - UFOField.MIN_SPAWN_DELAY) +
        UFOField.MIN_SPAWN_DELAY;
      this._spawnTimer = new TWEEN.Tween(timer)
        .to({ t: 1 }, randSpawnDelay)
        .start()
        .onComplete(() => this.spawnUfo());
    }
  };

  private spawnUfo = () => {
    const iq = Math.random() > 0.5 ? 2 : 1;
    const randDirX = Math.random() > 0.5 ? 1 : -1;
    this._ufo = new UFO(this.player, iq);
    this._ufo.position.x = randDirX > 0 ? 0 : window.innerWidth;
    this._ufo.position.y = Math.floor(
      Math.random() *
        (window.innerHeight - window.innerHeight / 4 - window.innerHeight / 4) +
        window.innerHeight / 4
    );
    this._ufo.data.physics.direction.x = randDirX;
    this.addChild(this._ufo);
    Game.audioManager.play(`ufo${iq}`);
  };

  public destroyUfo = () => {
    this._ufo?.stopShooting();
    Game.audioManager.stop(`ufo${this._ufo?.iqLevel}`);
    this._ufo?.destroy();
    this._ufo = null;
  };

  private explodeUfo = () => {
    let explosion = new AsteroidExplosion(this._ufo.position, () => {
      explosion.destroy();
      explosion = null;
    });
    this.addChild(explosion);

    this.destroyUfo();
  };

  public onUpdate = (dt) => {
    this._ufo?.onUpdate(dt);
  };

  public onAsteroidHitPlayer = (asteroid: Actor) => {};
  public onAsteroidHit(asteroid: Actor, bullet: Actor): void {}

  public onLevelComplete = () => {
    this._spawnTimer?.stop();
    this.queueSpawn();
  };
  public onGameOver = () => {
    this.destroyUfo();
    this._spawnTimer?.stop();
  };

  public onUfoHitPlayer = () => {
    this._ufo.stopShooting();
  };

  public onPlayerHitUfo = () => {
    this.player.laserGun.bullets[0].destroy();
    this.player.laserGun.bullets.shift();

    this.explodeUfo();
    this.queueSpawn();

    Game.audioManager.play(`bang2`);
  };
}
