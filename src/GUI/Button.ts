import { Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";
import { GameSettings } from "../Config/GameSettings";
import { Game } from "../Game/Game";
import Control from "./Control";

export default class Button extends Control {
  private _secondTexture: Texture;

  constructor(baseTexture: string, secondTexture: string) {
    super(baseTexture);

    this._secondTexture = Game.assetLoader.getTexture(secondTexture);

    this.initBaseEvents();

    this.addEvent("touchstart", () => {
      this._baseSprite.texture = this._secondTexture;
    });

    this.addEvent("touchend", () => {
      this._baseSprite.texture = this._baseTexture;
    });

    this.addEvent("touchendoutside", () => {
      this._baseSprite.texture = this._baseTexture;
    });
  }
}
