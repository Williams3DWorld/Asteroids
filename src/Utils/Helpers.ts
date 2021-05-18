import { Container } from "pixi.js";
import { GameSettings } from "../Config/GameSettings";
import * as TWEEN from "@tweenjs/tween.js";

export default class Helpers {
  public static timer = (
    milliseconds: number,
    onCompleteCallback: () => any
  ) => {
    const timer = { t: 0 };
    const tween = new TWEEN.Tween(timer)
      .to({ t: 1 }, milliseconds)
      .start()
      .onComplete(() => {
        tween.stop();
        TWEEN.remove(tween);
        onCompleteCallback();
      });
    return tween;
  };

  public static magnitude = (vector: any) => {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  };

  public static dot = (a: any, b: any) => {
    return a.x * b.x + b.x * b.y;
  };

  public static intersect = (
    ax: number,
    ay: number,
    bx: number,
    by: number,
    ar: number,
    br: number
  ) => {
    const padding = ar / 2 + br / 2;
    const abVector = {
      x: bx - ax,
      y: by - ay,
    };
    const length = Helpers.magnitude(abVector);
    return length - padding < 0;
  };

  public static updateScreenWrap = (object: Container, radius) => {
    const rad = radius / 2;
    if (object.x > GameSettings.width + rad) {
      object.x = 0 - rad;
    } else if (object.x < 0 - rad) {
      object.x = GameSettings.width + rad;
    }
    if (object.y > GameSettings.height + rad) {
      object.y = 0;
    } else if (object.y < 0 - rad) {
      object.y = GameSettings.height + rad;
    }
  };

  public static isMobile = () => {
    return navigator.userAgent.match(
      /(iPhone|iPod|iPad|Android|webOS|BlackBerry|IEMobile|Opera Mini)/i
    );
  };
}
