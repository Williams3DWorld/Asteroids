import { Container } from "@pixi/display";
import { Sprite, Text, Texture } from "pixi.js";
import Actor from "../Actors/Actor";
import { Game, IGameEvents } from "../Game/Game";
import MovingObjectData from "../Data/MovingObjectData";
import { ScoreStyle } from "../Config/TextStyles";
import * as TWEEN from "@tweenjs/tween.js";
import { GameSettings } from "../Config/GameSettings";
import Helpers from "../Utils/Helpers";
import VirtualController from "../GUI/VirtualController";

export default class GUI extends Container implements IGameEvents {
  public static PORTRAIT_SCALAR: number = 1; //window.innerHeight / window.innerWidth;

  private _hud: Container;
  private _lives: Array<Sprite>;
  private _score: Text;
  private _gameOver: Text;
  private _lifeTexture: Texture;

  constructor(private game: Game, virtualController?: VirtualController) {
    super();
    this.name = "GUI";
    this._lives = new Array();
    this._lifeTexture = Game.assetLoader.getTexture("life.png");

    this.initialise();

    if (virtualController) {
      this.addChild(virtualController);
      //this.scale.set(GUI.PORTRAIT_SCALAR);
    }
  }

  private initialise = () => {
    this.createHUD();
    this.createGameOver();
  };

  private createHUD = () => {
    this._hud = new Container();
    const hud = this._hud;
    hud.name = "HUD";
    hud.position.set(-50, 0);
    hud.scale.set(Game.virtualController ? GUI.PORTRAIT_SCALAR : 1);

    this.createScore();
    this.createLives();

    this.addChild(this._hud);
  };

  private createScore = () => {
    this._score = new Text("00", ScoreStyle);
    this._score.anchor.set(1.0, 0);
    this._score.x = 232;
    this._score.scale.set(1, 0.9);
    this._score.y = 90;
    this._hud.addChild(this._score);
  };

  public appendLife = () => {
    const life = new Sprite(this._lifeTexture);
    life.anchor.set(0.5);
    life.position.y = 132;
    life.position.x = 176 + this._lives.length * life.width;
    this._hud.addChild(life);
    this._lives.push(life);
  };

  private createLives = () => {
    for (let i = 0; i < MovingObjectData.MAX_LIVES; i++) {
      this.appendLife();
    }
  };

  private removeLife = () => {
    this._lives[this._lives.length - 1].destroy();
    this._lives.pop();
  };

  private resetLives = () => {
    this._lives = [];
    this.createLives();
  };

  private resetScore = () => {
    this._score.text = "00";
  };

  private createGameOver = () => {
    this._gameOver = new Text("GAME OVER", ScoreStyle);
    this._gameOver.anchor.set(0.5);
    this._gameOver.x = GameSettings.width / 2;
    this._gameOver.y = GameSettings.height / 2 - 50;
    this._gameOver.visible = false;
    this._gameOver.scale.set(Game.virtualController ? GUI.PORTRAIT_SCALAR : 1);
    this.addChild(this._gameOver);
  };

  onUpdate = (dt: number) => {};

  onAsteroidHit = (asteroid: Actor, bullet: Actor) => {
    this._score.text = this.game.score.toString();
  };

  onPlayerHit = (asteroid: Actor) => {
    this.removeLife();
  };

  onGameOver = () => {
    this._gameOver.visible = true;
    Helpers.timer(2500, () => {
      this.resetScore();
      this.resetLives();
      this._gameOver.visible = false;
    });
  };

  onLevelComplete = () => {};
}
