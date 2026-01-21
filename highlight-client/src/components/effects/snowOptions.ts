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
        value: 55,
        density: {
          enable: true,
          area: 800,
        },
      },
      opacity: {
        value: { min: 0.2, max: 0.5 },
      },
      size: {
        value: { min: 1, max: 3 },
      },
      move: {
        ...baseOptions.particles.move,
        speed: 0.8,
      },
    },
  },
  medium: {
    ...baseOptions,
    particles: {
      ...baseOptions.particles,
      number: {
        value: 85,
        density: {
          enable: true,
          area: 750,
        },
      },
      opacity: {
        value: { min: 0.25, max: 0.55 },
      },
      size: {
        value: { min: 1.2, max: 3.2 },
      },
      move: {
        ...baseOptions.particles.move,
        speed: 0.95,
      },
    },
  },
  high: {
    ...baseOptions,
    particles: {
      ...baseOptions.particles,
      number: {
        value: 120,
        density: {
          enable: true,
          area: 700,
        },
      },
      opacity: {
        value: { min: 0.3, max: 0.6 },
      },
      size: {
        value: { min: 1.3, max: 3.6 },
      },
      move: {
        ...baseOptions.particles.move,
        speed: 1.1,
      },
    },
  },
};

export const getSnowOptions = (intensity: SnowIntensity, isMobile: boolean): ISourceOptions => {
  const resolved = isMobile ? "low" : intensity;
  return intensityPresets[resolved];
};
