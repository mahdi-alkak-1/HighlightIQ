import { useEffect, useMemo, useRef, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { Engine } from "@tsparticles/engine";
import { getSnowOptions, SnowIntensity } from "@/components/effects/snowOptions";

interface SnowOverlayProps {
  enabled: boolean;
  intensity?: SnowIntensity;
  zIndex?: number;
}

const SnowOverlay = ({ enabled, intensity = "low", zIndex = 30 }: SnowOverlayProps) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const initRef = useRef(false);
  const [ready, setReady] = useState(false);

  const options = useMemo(() => getSnowOptions(intensity, isMobile), [intensity, isMobile]);

  useEffect(() => {
    if (!enabled || initRef.current) {
      return;
    }
    initRef.current = true;
    initParticlesEngine(async (engine: Engine) => {
      const { loadFull } = await import("tsparticles");
      await loadFull(engine);
    }).then(() => setReady(true));
  }, [enabled]);

  if (!enabled || !ready) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex }}
      aria-hidden="true"
    >
      <Particles
        id="snow-overlay"
        options={options}
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default SnowOverlay;
