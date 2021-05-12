import { Container } from "@pixi/display";
import { Emitter } from "pixi-particles";
import { Texture } from "pixi.js";

export default class AsteroidExplosion extends Container {
  constructor(position: any, onComplete: () => any) {
    super();
    this.name = "AsteroidExplosion";

    this.playParticleEffect(onComplete);

    this.position = position;
  }

  private playParticleEffect = (onComplete: () => any) => {
    const particleSystem = new Emitter(this, Texture.WHITE, {
      alpha: {
        list: [
          {
            value: 1,
            time: 0,
          },
          {
            value: 1,
            time: 1,
          },
        ],
        isStepped: false,
      },
      scale: {
        list: [
          {
            value: 0.08,
            time: 0,
          },
          {
            value: 0.08,
            time: 1,
          },
        ],
        isStepped: false,
      },
      color: {
        list: [
          {
            value: "FFFFFF",
            time: 0,
          },
          {
            value: "FFFFFF",
            time: 1,
          },
        ],
        isStepped: false,
      },
      speed: {
        list: [
          {
            value: 140,
            time: 0,
          },
          {
            value: 80,
            time: 1,
          },
        ],
        isStepped: false,
      },
      startRotation: {
        min: 0,
        max: 360,
      },
      rotationSpeed: {
        min: 0,
        max: 0,
      },
      lifetime: {
        min: 0.1,
        max: 0.3,
      },
      frequency: 0.008,
      spawnChance: 1,
      particlesPerWave: 1,
      emitterLifetime: 0.1,
      maxParticles: 8,
      pos: {
        x: 0,
        y: 0,
      },
      addAtBack: false,
      spawnType: "circle",
      spawnCircle: {
        x: 0,
        y: 0,
        r: 0.1,
      },
    });

    particleSystem.playOnceAndDestroy(onComplete);
  };
}
