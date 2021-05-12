import { Container } from "@pixi/display";
import { Sprite, Text, Texture } from "pixi.js";
import Actor from "./Actor";
import { AsteroidPointData } from "./Asteroid";
import { Game, IGameEvents } from "./Game";
import MovingObjectData from "./MovingObjectData";
import { ScoreStyle } from "./TextStyles";
import * as TWEEN from "@tweenjs/tween.js";
import { GameSettings } from "./GameSettings";
import Helpers from "./Helpers";

export default class GUI extends Container implements IGameEvents {
  private _lives: Array<Sprite>;
  private _score: Text;
  private _gameOver: Text;
  private _lifeTexture: Texture;

  constructor(private game: Game) {
    super();
    this.name = "GUI";
    this._lives = new Array();
    this._lifeTexture = Game.assetLoader.getTexture("life.png");

    this.initialise();
  }

  private initialise = () => {
    this.createScore();
    this.createLives();
    this.createGameOver();
  };

  private createScore = () => {
    this._score = new Text("00", ScoreStyle);
    this._score.anchor.set(1.0, 0);
    this._score.x = 232;
    this._score.scale.set(1, 0.9);
    this._score.y = 90;
    this.addChild(this._score);
  };

  public appendLife = () => {
    const life = new Sprite(this._lifeTexture);
    life.anchor.set(0.5);
    life.position.y = 132;
    life.position.x = 176 + this._lives.length * life.width;
    this.addChild(life);
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
