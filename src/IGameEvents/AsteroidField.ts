import { Container } from "pixi.js";
import Actor from "../Actors/Actor";
import { Asteroid } from "../Actors/Asteroid";
import AsteroidExplosion from "../FX/AsteroidExplosion";
import { Game, IGameEvents } from "../Game/Game";
import { GameSettings } from "../Config/GameSettings";
import Helpers from "../Utils/Helpers";
import MovingObjectData from "../Data/MovingObjectData";
import PhysicsData from "../Data/PhysicsData";
import * as TWEEN from "@tweenjs/tween.js";
import GUI from "./GUI";

enum Sides {
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
}

export default class AsteroidField extends Container implements IGameEvents {
  public static readonly MAX_SPAWN_DELAY = 1;
  public static readonly DEFAULT_NUM_ASTEROIDS = 1;

  private _asteroids: Array<Actor>;
  public get asteroids(): Array<Actor> {
    return this._asteroids;
  }

  private _elapsed: number;
  private _spawnDelay: number;
  private _numAsteroidsToSpawn: number;
  private _spawnCounter: number;

  constructor(private game: Game) {
    super();
    this.name = "AsteroidField";
    this._asteroids = new Array<Asteroid>();
    this._elapsed = new Date().getTime();
    this.reset();
    this.randomiseSpawnDelay();
  }

  private reset = () => {
    this._spawnCounter = 0;
    this._numAsteroidsToSpawn =
      AsteroidField.DEFAULT_NUM_ASTEROIDS + this.game.level;
  };

  private randomiseSpawnDelay = () => {
    this._spawnDelay =
      Math.random() * (AsteroidField.MAX_SPAWN_DELAY - 0.1) + 0.1;
  };

  private getRandPosFromSide = (sideIndex: number) => {
    let pos = { x: 0, y: 0 };
    let randPos = 0;
    const maxWidth = GameSettings.width;
    const maxHeight = GameSettings.height;
    const isWidth = sideIndex == Sides.TOP || sideIndex == Sides.BOTTOM;
    if (isWidth) {
      randPos = Math.floor(Math.random() * maxWidth);
      pos = { x: randPos, y: maxHeight * (sideIndex % 2) };
    } else {
      randPos = Math.floor(Math.random() * maxHeight);
      pos = { x: maxWidth * (sideIndex % 2), y: randPos };
    }

    return pos;
  };

  private randAsteroidSpeed = (mass: number) => {
    return (
      Math.random() * (Asteroid.MAX_SPEED - Asteroid.MIN_SPEED) +
      ((Asteroid.MIN_SPEED + 1) / mass) * 0.5
    );
  };

  private spawnAsteroid = (lives?: number, speed?: number, direction?: any) => {
    const randSide = Math.floor(Math.random() * 4);
    const pos = this.getRandPosFromSide(randSide);

    const numLives = MovingObjectData.MAX_LIVES;

    const randAngle = Math.random() * (Math.PI * 2);
    let dir = direction
      ? direction
      : { x: Math.sin(randAngle), y: Math.cos(randAngle) };

    const scale =
      (numLives / MovingObjectData.MAX_LIVES) *
      Asteroid.DEFUALT_SCALE *
      (Game.virtualController ? GUI.PORTRAIT_SCALAR : 1);

    const speedFinal =
      (speed != null ? speed : this.randAsteroidSpeed(scale)) *
      (Game.virtualController ? GUI.PORTRAIT_SCALAR : 1);

    const physicsData = new PhysicsData(
      Asteroid.DEFUALT_SIZE * scale,
      speedFinal,
      dir
    );

    const asteroid = new Asteroid(numLives, physicsData);
    this.addChild(asteroid);
    asteroid.position.set(pos.x, pos.y);
    asteroid.scale.set(scale, scale);
    asteroid.rotation = randAngle;
    this._asteroids.push(asteroid);

    this._spawnCounter++;
  };

  private splitAsteroid = (asteroid: Actor) => {
    const parentData = asteroid.data;
    const radius = parentData.physics.radius;
    const minSpeedMultiplyer = 1 + Asteroid.MIN_SPEED;
    const speed =
      parentData.physics.speed *
      (Math.random() * (Asteroid.MAX_SPEED - minSpeedMultiplyer) +
        minSpeedMultiplyer);
    const lives = parentData.lives - 1;
    const scale =
      (lives / MovingObjectData.MAX_LIVES) *
      Asteroid.DEFUALT_SCALE *
      (Game.virtualController ? GUI.PORTRAIT_SCALAR : 1);
    const asteroids: Array<Asteroid> = new Array<Asteroid>();
    for (let i = 0; i < 2; i++) {
      asteroids.push(
        new Asteroid(lives, new PhysicsData(radius, speed, { x: 1, y: 0 }))
      );

      asteroids[i].scale.set(scale);
      asteroids[i].position.set(asteroid.position.x, asteroid.position.y);
      this.parent.addChild(asteroids[i]);
      this.asteroids.push(asteroids[i]);
    }

    const dx = parentData.physics.direction.x;
    const dy = parentData.physics.direction.y;

    const rot = Math.atan2(dy, dx) + 90 * (Math.PI / 180);
    const r0 = rot + 45 * (Math.PI / 180);
    const r1 = rot - 45 * (Math.PI / 180);

    asteroids[0].data.physics.direction.x = Math.sin(r0);
    asteroids[0].data.physics.direction.y = -Math.cos(r0);
    asteroids[1].data.physics.direction.x = Math.sin(r1);
    asteroids[1].data.physics.direction.y = -Math.cos(r1);
  };

  private destroyAsteroid(asteroid: Actor) {
    this.explodeAsteroid(asteroid);
    asteroid?.destroy();
    const index = this._asteroids.indexOf(asteroid);
    this._asteroids.splice(index, 1);
  }

  private destroyAsteroids = () => {
    this._asteroids.forEach((asteroid) => {
      asteroid.destroy();
    });
    this._asteroids = [];
  };

  public finishedSpawning = () => {
    return this._spawnCounter >= this._numAsteroidsToSpawn;
  };

  public onUpdate = (dt) => {
    if (!this.finishedSpawning()) {
      const now: number = new Date().getTime();
      const diff = now - this._elapsed;
      if (diff > this._spawnDelay * 1000) {
        this._elapsed = now;
        this.spawnAsteroid();
        this.randomiseSpawnDelay();
      }
    }

    this._asteroids.forEach((asteroid) => {
      asteroid.onUpdate(dt);
      Helpers.updateScreenWrap(asteroid, asteroid.data.physics.radius);
    });
  };

  private explodeAsteroid = (asteroid: Actor) => {
    let explosion = new AsteroidExplosion(asteroid.position, () => {
      explosion.destroy();
      explosion = null;
    });
    this.addChild(explosion);
  };

  public onAsteroidHit = (asteroid: Actor, bullet: Actor) => {
    if (asteroid.data.lives > 1) {
      this.splitAsteroid(asteroid);
    }

    Game.audioManager.play(`bang${asteroid.data.lives - 1}`);
    this.destroyAsteroid(asteroid);

    if (this._asteroids.length == 0) {
      this.game.dispatchLevelComplete();
      this.reset();
    }
  };

  public onAsteroidHitPlayer = (asteroid: Actor) => {
    // Do nothing.
  };

  public onLevelComplete = () => {
    this.destroyAsteroids();
    this.reset();
  };

  public onGameOver = () => {
    this.destroyAsteroids();
    Helpers.timer(3000, () => this.reset());
  };

  public onUfoHitPlayer = () => {};
  public onPlayerHitUfo = () => {};
}
