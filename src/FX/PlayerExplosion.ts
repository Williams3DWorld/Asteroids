import { Container } from "@pixi/display";
import { Graphics } from "@pixi/graphics";
import * as TWEEN from "@tweenjs/tween.js";

const debreeDirectionData = [
  { x: 0.9, y: -0.75 },
  { x: -0.4, y: -0.75 },
  { x: -0.6, y: 0.8 },
];

export default class PlayerExplosion extends Container {
  constructor(onComplete: () => any) {
    super();

    this.name = "PlayerExplosion";

    this.playAnimation(onComplete);
  }

  private createLine = (points: any) => {
    const line = new Graphics();
    line.lineStyle(1, 0xffffff);
    line.moveTo(points[0].x, points[0].y);
    line.lineTo(points[1].x, points[1].y);
    return line;
  };

  private playAnimation = (onComplete: () => any) => {
    const scalar = 26;

    const line0 = this.createLine([
      { x: -6, y: -2 },
      { x: 4, y: 10 },
    ]);
    const line1 = this.createLine([
      { x: -6, y: -1 },
      { x: -10, y: 10 },
    ]);
    const line2 = this.createLine([
      { x: -8, y: 4 },
      { x: 8, y: 9 },
    ]);

    const lines = [line0, line1, line2];

    lines.forEach((line, i) => {
      line.alpha = 0.6;
      this.addChild(line);
      const dest = {
        x: line.x + debreeDirectionData[i].x * scalar,
        y: line.y + debreeDirectionData[i].y * scalar,
      };

      const objTween = { x: line.x, y: line.y };
      const duration = 500 + i * 500;
      new TWEEN.Tween(objTween)
        .to({ x: dest.x, y: dest.y }, duration)
        .start()
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          line.x = objTween.x;
          line.y = objTween.y;
        })
        .onComplete(() => {
          if (i == lines.length - 1) onComplete();
        })
        .chain(new TWEEN.Tween(line).to({ alpha: 0 }, duration).start());
    });
  };
}
