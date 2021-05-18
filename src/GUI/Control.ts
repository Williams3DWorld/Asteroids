import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { Game } from "../Game/Game";

export default class Control extends Container {
  protected _baseSprite: Sprite;
  protected _baseTexture: Texture;

  protected _active: boolean;
  public get active(): boolean {
    return this._active;
  }

  constructor(textureName: string) {
    super();

    this._active = false;

    this._baseTexture = Game.assetLoader.getTexture(textureName);
    this._baseSprite = new Sprite(this._baseTexture);
    this._baseSprite.anchor.set(0.5);
    this.addChild(this._baseSprite);

    this._baseSprite.interactive = true;

    this.alpha = 0.5;

    this.initBaseEvents();
  }

  protected initBaseEvents = () => {
    this._baseSprite.on("touchstart", () => {
      this._active = true;
      this.alpha = 1;
    });
    this._baseSprite.on("touchend", () => {
      this._active = false;
      this.alpha = 0.5;
    });
    this._baseSprite.on("touchendoutside", () => {
      this._active = true;
      this.alpha = 0.5;
    });
  };

  public addEvent = (type: string, callback: () => any) => {
    this._baseSprite.on(type, callback);
  };
}
