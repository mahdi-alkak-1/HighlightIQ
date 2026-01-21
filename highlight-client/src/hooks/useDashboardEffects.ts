import { useEffect, useState } from "react";
import { SnowIntensity } from "@/components/effects/snowOptions";

interface DashboardEffectsStored {
  enabled: boolean;
  intensity: SnowIntensity;
}

const STORAGE_KEY = "highlightiq_dashboard_effects";

const readStorage = (): DashboardEffectsStored => {
  if (typeof window === "undefined") {
    return { enabled: false, intensity: "low" };
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { enabled: false, intensity: "low" };
  }
  try {
    const parsed = JSON.parse(raw) as DashboardEffectsStored;
    return {
      enabled: Boolean(parsed.enabled),
      intensity: parsed.intensity ?? "low",
    };
  } catch {
    return { enabled: false, intensity: "low" };
  }
};

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
};

export const useDashboardEffects = () => {
  const [enabled, setEnabled] = useState(false);
  const [intensity, setIntensity] = useState<SnowIntensity>("low");
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const stored = readStorage();
    setEnabled(stored.enabled);
    setIntensity(stored.intensity);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const next: DashboardEffectsStored = { enabled, intensity };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [enabled, intensity]);

  const effectiveEnabled = enabled && !prefersReducedMotion;

  return {
    enabled,
    intensity,
    prefersReducedMotion,
    effectiveEnabled,
    setEnabled,
    setIntensity,
  };
};
