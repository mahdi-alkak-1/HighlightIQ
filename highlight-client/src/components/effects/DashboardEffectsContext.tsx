import { createContext, ReactNode, useContext } from "react";
import { SnowIntensity } from "@/components/effects/snowOptions";

export interface DashboardEffectsState {
  enabled: boolean;
  intensity: SnowIntensity;
  prefersReducedMotion: boolean;
  setEnabled: (value: boolean) => void;
  setIntensity: (value: SnowIntensity) => void;
}

const DashboardEffectsContext = createContext<DashboardEffectsState | null>(null);

export const DashboardEffectsProvider = ({
  value,
  children,
}: {
  value: DashboardEffectsState;
  children: ReactNode;
}) => {
  return <DashboardEffectsContext.Provider value={value}>{children}</DashboardEffectsContext.Provider>;
};

export const useDashboardEffectsContext = () => {
  const ctx = useContext(DashboardEffectsContext);
  if (!ctx) {
    throw new Error("DashboardEffectsContext is not available");
  }
  return ctx;
};
