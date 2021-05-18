import PIXI, { utils, Loader } from "pixi.js";

export default class TextureLoader {
  private _pixiLoader: Loader;

  constructor() {
    this._pixiLoader = new Loader("assets/textures/");
  }

  public addTextureToPixiLoader = (uri: string, name: string) => {
    this._pixiLoader.add(name, uri);
  };

  public loadPixiAssets = (onCompleteCallback: () => void) => {
    this._pixiLoader.load(onCompleteCallback);
  };

  public getTexture = (name: string) => {
    const tex = utils.TextureCache[name];
    console.assert(tex);
    return tex;
  };
}
