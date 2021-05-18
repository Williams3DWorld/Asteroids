import {
  utils,
  Application,
  Container,
  Ticker,
  InteractionManager,
} from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import AssetLoader from "../Utils/TextureLoader";
import AsteroidField from "../IGameEvents/AsteroidField";
import { GameSettings } from "../Config/GameSettings";
import PlayerController from "../IGameEvents/PlayerController";
import Helpers from "../Utils/Helpers";
import Actor from "../Actors/Actor";
import GUI from "../IGameEvents/GUI";
import FontFaceObserver from "fontfaceobserver";
import { AsteroidPointData } from "../Actors/Asteroid";
import MovingObjectData from "../Data/MovingObjectData";
import AudioManager from "../Utils/AudioLoader";
import VirtualController from "../GUI/VirtualController";

export interface IGameEvents {
  onUpdate(dt: number): void;
  onAsteroidHit(asteroid: Actor, bullet: Actor): void;
  onPlayerHit(asteroid: Actor): void;
  onGameOver(): void;
  onLevelComplete(): void;
}

export class Game {
  public static EXTRA_LIFE_POINTS_INTERVAL = 10_000;

  private _stage: Container;
  public get stage(): Container {
    return this._stage;
  }

  private _pixiApp: Application;
  public get pixiApp(): Application {
    return this._pixiApp;
  }

  private _contextType: string;
  public get contextType(): string {
    return this._contextType;
  }

  private _pixiTicker: Ticker;
  public get pixiTicker(): Ticker {
    return this._pixiTicker;
  }

  private _level: number;
  public get level(): number {
    return this._level;
  }

  private _gui: GUI;
  private _player: PlayerController;
  private _asteroidField: AsteroidField;
  private _interaction: InteractionManager;
  private _extraLifeAcculator: number;
  private _gameOver: boolean;

  public score: number;
  public static assetLoader: AssetLoader;
  public static audioManager: AudioManager;
  public static virtualController: VirtualController;
  public static mousePos: any = { x: 0, y: 0 };

  /* --------------- Wave beat vars --------------- */
  private _waveTimeDuration: number;
  private _lowerBeat: boolean;
  private _waveTime: number;
  private _waveIncrementalRate: number;
  private _waveTimeOffset: number;
  private _waveTimeNormalised: number;
  private _waveTimeNormalisedQuadraticRate: number;
  private _initialWaveTimeInterval: number;

  constructor() {
    this._level = 1;
    this._extraLifeAcculator = 0;
    this._gameOver = false;
    this.score = 0;

    this.resetWaveSound();

    this.initPixi();
    this.loadAssets();
  }

  private initPixi = () => {
    this._contextType = "WebGL";
    if (!utils.isWebGLSupported()) {
      this._contextType = "canvas";
    }

    utils.sayHello(this._contextType);

    this.initPixiApplication();
  };

  private initPixiApplication = () => {
    this._pixiApp = new Application(GameSettings);

    const app = this._pixiApp;
    document.body.appendChild(app.view);

    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.view.style.left = "50%";
    app.renderer.view.style.top = "50%";
    app.renderer.view.style.transform = "translate3d( -50%, -50%, 0)";
    // app.renderer.view.style.transform = "rotate(0deg)";

    this._stage = app.stage;
    this._interaction = new InteractionManager(this._pixiApp.renderer, {});
  };

  public loadAssets = async () => {
    const fontPromise = new FontFaceObserver("Hyperspace").load(null, 5000);
    await fontPromise;

    Game.assetLoader = new AssetLoader();
    Game.assetLoader.addTextureToPixiLoader("atlas.json", "atlas");
    if (Helpers.isMobile())
      Game.assetLoader.addTextureToPixiLoader("controller.json", "controller");
    Game.assetLoader.loadPixiAssets(this.initialise);

    Game.audioManager = new AudioManager();
    Game.audioManager.setLoop("thrust", true);
  };

  public initialise = () => {
    this.initialiseVirtualController();
    this.initialiseGame();
    this.initialiseGUI();
  };

  private initialiseGame = () => {
    this._player = new PlayerController(this);
    this._stage.addChild(this._player);
    this._asteroidField = new AsteroidField(this);
    this._stage.addChild(this._asteroidField);

    this.initialiseEvents();

    this._pixiTicker = Ticker.shared;
    this._pixiTicker.add((dt) => {
      this.onUpdate(dt);
    });
  };

  private initialiseVirtualController = () => {
    if (Helpers.isMobile()) {
      GameSettings.width = window.innerWidth;
      GameSettings.height = window.innerHeight;
      this._pixiApp.renderer.resize(GameSettings.width, GameSettings.height);
      Game.virtualController = new VirtualController();
    }
  };

  private initialiseGUI = () => {
    this._gui = new GUI(this, Game.virtualController);
    this._stage.addChild(this._gui);
  };

  private initialiseEvents = () => {
    if (Game.virtualController) {
      document.ontouchmove = (e) => {
        const data = this._interaction.eventData.data;
        Game.mousePos = { x: data.global.x, y: data.global.y };
      };
      return;
    }

    document.onmousemove = (e) => {
      const data = this._interaction.eventData.data;
      this._player.updateMousePos(data);
    };

    document.onmousedown = (e) => {
      this._player.updateMouseButtonDown(e.button);
    };

    document.onmouseup = (e) => {
      this._player.updateMouseButtonUp(e.button);
    };
  };

  private updateBulletAsteroidCollision = () => {
    for (let i = 0; i < this._asteroidField.asteroids.length; i++) {
      const asteroid = this._asteroidField.asteroids[i];
      for (let j = 0; j < this._player.bullets.length; j++) {
        const bullet = this._player.bullets[j];
        if (asteroid.isReady && bullet.visible) {
          if (
            Helpers.intersect(
              bullet.x,
              bullet.y,
              asteroid.x,
              asteroid.y,
              bullet.data.physics.radius,
              asteroid.data.physics.radius
            )
          ) {
            this.score += AsteroidPointData[asteroid.data.lives - 1];
            this._player.onAsteroidHit(asteroid, bullet);
            this._asteroidField.onAsteroidHit(asteroid, bullet);
            this._gui.onAsteroidHit(asteroid, bullet);
            break;
          }
        }
      }
    }
  };

  private updateAsteroidPlayerCollision = () => {
    for (let i = 0; i < this._asteroidField.asteroids.length; i++) {
      const asteroid = this._asteroidField.asteroids[i];
      if (asteroid.isReady && this._player.isReady()) {
        if (
          Helpers.intersect(
            this._player.x,
            this._player.y,
            asteroid.x,
            asteroid.y,
            this._player.getData().physics.radius,
            asteroid.data.physics.radius
          )
        ) {
          this._player.onPlayerHit(asteroid);
          this._asteroidField.onPlayerHit(asteroid);
          this._gui.onPlayerHit(asteroid);

          break;
        }
      }
    }
  };

  private updateExtraLives = () => {
    if (
      this.score - this._extraLifeAcculator >
      Game.EXTRA_LIFE_POINTS_INTERVAL
    ) {
      this._extraLifeAcculator += Game.EXTRA_LIFE_POINTS_INTERVAL;
      if (this._player.getData().lives != MovingObjectData.MAX_LIVES) {
        this._player.addLife();
        this._gui.appendLife();
        Game.audioManager.play("extraShip");
      }
    }
  };

  private resetScore = () => {
    this.score = 0;
  };

  private resetLevel = () => {
    this.resetWaveSound();
  };

  public dispatchGameOver = () => {
    this._level = 1;
    this._player.onGameOver();
    this._asteroidField.onGameOver();
    this._gui.onGameOver();
    this.resetLevel();
    this.resetScore();
    this._gameOver = true;
    Helpers.timer(3000, () => (this._gameOver = false));
  };

  public dispatchLevelComplete = () => {
    this._level++;
    this._asteroidField.onLevelComplete();
    this.resetLevel();
  };

  private resetWaveSound = () => {
    this._waveTimeDuration = 120 * 1000;
    this._lowerBeat = false;
    this._waveTime = 0;
    this._waveIncrementalRate = 0.1;
    this._waveTimeOffset = 20 * 1000 - window.performance.now();
    this._waveTimeNormalised = 0;
    this._waveTimeNormalisedQuadraticRate = 5;
    this._initialWaveTimeInterval = 0.1;
  };

  private updateWaveSound = (dt) => {
    const now: number = window.performance.now() + this._waveTimeOffset;
    this._waveTimeNormalised =
      now / this._waveTimeDuration < 1 ? now / this._waveTimeDuration : 1;
    if (
      this._waveTime >
      this._initialWaveTimeInterval *
        (this._waveTimeNormalised + 1) *
        this._waveTimeNormalisedQuadraticRate
    ) {
      const index = this._lowerBeat ? 1 : 0;
      Game.audioManager.play(`beat${index}`);
      this._lowerBeat = !this._lowerBeat;
      this._waveTime = 0;
    } else {
      this._waveTime +=
        this._waveTimeNormalised * this._waveIncrementalRate * dt;
    }
  };

  private updateCollisions = () => {
    this.updateBulletAsteroidCollision();
    this.updateAsteroidPlayerCollision();
  };

  public onUpdate = (dt: number) => {
    //GameSettings.width = window.innerWidth;
    //GameSettings.height = window.innerHeight;
    this._pixiApp.renderer.resize(GameSettings.width, GameSettings.height);

    this._player.onUpdate(dt);
    this._asteroidField.onUpdate(dt);
    this.updateCollisions();
    this.updateExtraLives();
    if (!this._gameOver) this.updateWaveSound(dt);
    TWEEN.update();
  };
}
