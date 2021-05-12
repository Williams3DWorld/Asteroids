import { SoundData } from "./AudioFileData";
import { Howl, Howler } from "howler";

export default class AudioManager {
  private _audioClips: { [key: string]: Howl } = {};

  constructor() {
    this.loadAssets();
  }

  private loadAssets = () => {
    SoundData.forEach((sound) => {
      this._audioClips[sound.name] = new Howl({
        src: [sound.url],
        autoplay: false,
        loop: false,
        volume: 0.25,
      });
    });
  };

  private validateObject = (name: string) => {
    console.assert(this._audioClips[name]);
  };

  public play = (name: string) => {
    this.validateObject(name);
    this._audioClips[name].play();
  };

  public setLoop = (name: string, value: boolean) => {
    this.validateObject(name);
    this._audioClips[name].loop(value);
  };

  public setRate = (name: string, value: number) => {
    this.validateObject(name);
    this._audioClips[name].rate(value);
  };

  public stop = (name: string) => {
    this.validateObject(name);
    this._audioClips[name].stop();
  };
}
