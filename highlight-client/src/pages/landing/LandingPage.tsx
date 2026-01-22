import { Suspense, lazy, useMemo } from "react";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingMetrics from "@/components/landing/LandingMetrics";
import LandingSnowToggle from "@/components/landing/LandingSnowToggle";
import { useDashboardEffects } from "@/hooks/useDashboardEffects";

const LandingPage = () => {
  const effects = useDashboardEffects();
  const LazySnowOverlay = useMemo(() => lazy(() => import("@/components/effects/SnowOverlay")), []);

  return (
    <div className="min-h-screen bg-[#0d1016]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(28,47,255,0.16),transparent_45%),radial-gradient(circle_at_10%_60%,rgba(16,77,199,0.18),transparent_50%)]" />
        <LandingHeader />
        <LandingHero />
      </div>
      <LandingFeatures />
      <LandingMetrics />
      <LandingCTA />
      <div className="px-6 pb-10 md:px-12">
        <div className="mx-auto max-w-5xl">
          <LandingSnowToggle
            enabled={effects.enabled}
            prefersReducedMotion={effects.prefersReducedMotion}
            onToggle={() => effects.setEnabled(!effects.enabled)}
          />
        </div>
      </div>
      <LandingFooter />
      {effects.effectiveEnabled && (
        <Suspense fallback={null}>
          <LazySnowOverlay enabled intensity={effects.intensity} zIndex={50} />
        </Suspense>
      )}
    </div>
  );
};

export default LandingPage;
