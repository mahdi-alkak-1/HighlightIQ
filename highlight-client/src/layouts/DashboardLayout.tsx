import { ReactNode, Suspense, useMemo, lazy } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import { DashboardEffectsProvider } from "@/components/effects/DashboardEffectsContext";
import { useDashboardEffects } from "@/hooks/useDashboardEffects";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const effects = useDashboardEffects();
  const LazySnowOverlay = useMemo(() => lazy(() => import("@/components/effects/SnowOverlay")), []);

  return (
    <DashboardEffectsProvider
      value={{
        enabled: effects.enabled,
        intensity: effects.intensity,
        prefersReducedMotion: effects.prefersReducedMotion,
        setEnabled: effects.setEnabled,
        setIntensity: effects.setIntensity,
      }}
    >
      <div className="relative h-screen overflow-hidden bg-brand-bg text-white">
        <div className="fixed left-0 top-0 h-screen w-60">
          <Sidebar />
        </div>
        <main className="ml-60 h-screen overflow-y-auto px-8 py-6 scrollbar-slim">
          {children}
        </main>
        {effects.effectiveEnabled && (
          <Suspense fallback={null}>
            <LazySnowOverlay enabled intensity={effects.intensity} />
          </Suspense>
        )}
      </div>
    </DashboardEffectsProvider>
  );
};

export default DashboardLayout;
