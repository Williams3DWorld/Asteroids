import { Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";
import { Game } from "../Game/Game";
import Control from "./Control";

export default class Dial extends Control {
  private _dialTexture: Texture;
  private _dialSprite: Sprite;

  constructor(baseTexture: string, secondTexture: string) {
    super(baseTexture);

    this._dialTexture = Game.assetLoader.getTexture(secondTexture);
    this._dialSprite = new Sprite(this._dialTexture);
    this._dialSprite.anchor.set(0.5);
    this.addChild(this._dialSprite);

    this.initBaseEvents();

    this._baseSprite.on("touchmove", this.onTouchMove);
  }

  private onTouchMove = () => {
    if (this._active) {
      const dx = Game.mousePos.x - this.position.x;
      const dy = Game.mousePos.y - this.position.y;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      this.angle = angle;
    }
  };
}
