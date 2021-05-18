import { Container } from "pixi.js";
import GUI from "../IGameEvents/GUI";
import Button from "./Button";
import Dial from "./Dial";

export enum VirtualControls {
  THRUST = "thrust",
  FIRE = "fire",
  DIAL = "dial",
}

export enum VirtualButtons {
  BTN_THRUST,
  BTN_FIRE,
}

export default class VirtualController extends Container {
  private _buttons: Array<Button>;

  private _dial: Dial;
  public get dial(): Dial {
    return this._dial;
  }

  constructor() {
    super();

    this._buttons = Array();

    this.create();
  }

  private create = () => {
    this.createButton(VirtualControls.THRUST, {
      x: window.innerWidth - 120 * GUI.PORTRAIT_SCALAR,
      y: window.innerHeight - 60 * GUI.PORTRAIT_SCALAR,
    });

    this.createButton(VirtualControls.FIRE, {
      x: window.innerWidth - 60 * GUI.PORTRAIT_SCALAR,
      y: window.innerHeight - 100 * GUI.PORTRAIT_SCALAR,
    });

    this.createDial();
  };

  private createButton = (type: VirtualControls, position: any) => {
    const name = type.valueOf();
    const button = new Button(
      `gui_${name}_button_up.png`,
      `gui_${name}_button_down.png`
    );
    button.position = position;
    button.scale.set(0.85 * GUI.PORTRAIT_SCALAR);
    this.addChild(button);
    this._buttons.push(button);
  };

  private createDial = () => {
    this._dial = new Dial("gui_dial_pane.png", "gui_dial.png");
    this._dial.position.set(
      70 * GUI.PORTRAIT_SCALAR,
      window.innerHeight - 70 * GUI.PORTRAIT_SCALAR
    );
    this.dial.scale.set(0.76 * GUI.PORTRAIT_SCALAR);
    this.addChild(this._dial);
  };

  public bindButtonDownEvent = (button: number, callback: () => any) => {
    this._buttons[button].addEvent("touchstart", callback);
  };

  public bindButtonUpEvent = (button: number, callback: () => any) => {
    this._buttons[button].addEvent("touchendoutside", callback);
    this._buttons[button].addEvent("touchend", callback);
  };

  public bindDialMoveEvent = (callback: () => any) => {
    this._dial.addEvent("touchmove", callback);
  };
}
