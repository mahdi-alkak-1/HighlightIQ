import { ISourceOptions } from "@tsparticles/engine";

export type SnowIntensity = "low" | "medium" | "high";

const baseParticles = {
  number: {
    value: 60,
  },
  color: {
    value: "#FFFFFF",
  },
  opacity: {
    value: { min: 0.15, max: 0.45 },
  },
  size: {
    value: { min: 1, max: 3 },
  },
  move: {
    enable: true,
    speed: 0.6,
    direction: "bottom",
    straight: false,
    outModes: {
      default: "out",
    },
  },
} as const;

const baseOptions: ISourceOptions = {
  fullScreen: {
    enable: false,
  },
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 30,
  detectRetina: true,
  particles: baseParticles,
};

const intensityPresets: Record<SnowIntensity, ISourceOptions> = {
  low: {
    ...baseOptions,
    particles: {
      ...baseParticles,
      number: {
        value: 170,
      },
      opacity: {
        value: { min: 0.4, max: 0.8 },
      },
      size: {
        value: { min: 1.6, max: 4.6 },
      },
      move: {
        ...baseParticles.move,
        speed: 1.8,
      },
    },
  },
  medium: {
    ...baseOptions,
    particles: {
      ...baseParticles,
      number: {
        value: 240,
      },
      opacity: {
        value: { min: 0.45, max: 0.85 },
      },
      size: {
        value: { min: 1.8, max: 4.8 },
      },
      move: {
        ...baseParticles.move,
        speed: 2.1,
      },
    },
  },
  high: {
    ...baseOptions,
    particles: {
      ...baseParticles,
      number: {
        value: 340,
      },
      opacity: {
        value: { min: 0.5, max: 0.9 },
      },
      size: {
        value: { min: 2.0, max: 5.2 },
      },
      move: {
        ...baseParticles.move,
        speed: 2.5,
      },
    },
  },
};

export const getSnowOptions = (intensity: SnowIntensity, isMobile: boolean): ISourceOptions => {
  const resolved = isMobile ? "low" : intensity;
  return intensityPresets[resolved];
};
