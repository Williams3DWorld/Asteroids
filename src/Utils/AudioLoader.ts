import { SoundData } from "../Data/AudioFileData";
import { Howl, Howler } from "howler";

export default class AudioLoader {
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

  private invalidObject = (name: string) => {
    return this._audioClips[name] == null;
  };

  public play = (name: string) => {
    if (this.invalidObject(name)) return;
    this._audioClips[name].play();
  };

  public setLoop = (name: string, value: boolean) => {
    if (this.invalidObject(name)) return;
    this._audioClips[name].loop(value);
  };

  public setRate = (name: string, value: number) => {
    if (this.invalidObject(name)) return;
    this._audioClips[name].rate(value);
  };

  public stop = (name: string) => {
    if (this.invalidObject(name)) return;
    this._audioClips[name].stop();
  };
}
