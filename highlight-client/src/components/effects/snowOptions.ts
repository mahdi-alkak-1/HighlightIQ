import { ISourceOptions } from "tsparticles-engine";

export type SnowIntensity = "low" | "medium" | "high";

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
  particles: {
    number: {
      value: 60,
      density: {
        enable: true,
        area: 800,
      },
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
  },
};

const intensityPresets: Record<SnowIntensity, ISourceOptions> = {
  low: {
    ...baseOptions,
    particles: {
      ...baseOptions.particles,
      number: {
        value: 170,
        density: {
          enable: true,
          area: 620,
        },
      },
      opacity: {
        value: { min: 0.4, max: 0.8 },
      },
      size: {
        value: { min: 1.6, max: 4.6 },
      },
      move: {
        ...baseOptions.particles.move,
        speed: 1.8,
      },
    },
  },
  medium: {
    ...baseOptions,
    particles: {
      ...baseOptions.particles,
      number: {
        value: 240,
        density: {
          enable: true,
          area: 560,
        },
      },
      opacity: {
        value: { min: 0.45, max: 0.85 },
      },
      size: {
        value: { min: 1.8, max: 4.8 },
      },
      move: {
        ...baseOptions.particles.move,
        speed: 2.1,
      },
    },
  },
  high: {
    ...baseOptions,
    particles: {
      ...baseOptions.particles,
      number: {
        value: 340,
        density: {
          enable: true,
          area: 520,
        },
      },
      opacity: {
        value: { min: 0.5, max: 0.9 },
      },
      size: {
        value: { min: 2.0, max: 5.2 },
      },
      move: {
        ...baseOptions.particles.move,
        speed: 2.5,
      },
    },
  },
};

export const getSnowOptions = (intensity: SnowIntensity, isMobile: boolean): ISourceOptions => {
  const resolved = isMobile ? "low" : intensity;
  return intensityPresets[resolved];
};
