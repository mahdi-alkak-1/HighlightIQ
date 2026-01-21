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
        value: 80,
        density: {
          enable: true,
          area: 700,
        },
      },
      opacity: {
        value: { min: 0.25, max: 0.6 },
      },
      size: {
        value: { min: 1, max: 3.4 },
      },
      move: {
        ...baseOptions.particles.move,
        speed: 1.0,
      },
    },
  },
  medium: {
    ...baseOptions,
    particles: {
      ...baseOptions.particles,
      number: {
        value: 120,
        density: {
          enable: true,
          area: 650,
        },
      },
      opacity: {
        value: { min: 0.3, max: 0.65 },
      },
      size: {
        value: { min: 1.3, max: 3.6 },
      },
      move: {
        ...baseOptions.particles.move,
        speed: 1.2,
      },
    },
  },
  high: {
    ...baseOptions,
    particles: {
      ...baseOptions.particles,
      number: {
        value: 170,
        density: {
          enable: true,
          area: 600,
        },
      },
      opacity: {
        value: { min: 0.35, max: 0.7 },
      },
      size: {
        value: { min: 1.4, max: 4 },
      },
      move: {
        ...baseOptions.particles.move,
        speed: 1.4,
      },
    },
  },
};

export const getSnowOptions = (intensity: SnowIntensity, isMobile: boolean): ISourceOptions => {
  const resolved = isMobile ? "low" : intensity;
  return intensityPresets[resolved];
};
