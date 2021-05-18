import { Sprite } from "@pixi/sprite";
import MovingObjectData from "../Data/MovingObjectData";
import * as TWEEN from "@tweenjs/tween.js";
import Helpers from "../Utils/Helpers";

export default class Actor extends Sprite {
  protected _ready: boolean;
  public get isReady(): boolean {
    return this._ready;
  }

  public set setReady(value: boolean) {
    this._ready = value;
  }

  constructor() {
    super();
    this._ready = false;
    this.anchor.set(0.5);
  }

  protected startReadyDelay = (seconds: number) => {
    Helpers.timer(seconds * 1000, () => (this._ready = true));
  };

  public data: MovingObjectData;
  public onUpdate = (dt) => {};
}
