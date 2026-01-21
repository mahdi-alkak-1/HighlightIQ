import LandingCTA from "@/components/landing/LandingCTA";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingMetrics from "@/components/landing/LandingMetrics";

const LandingPage = () => {
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
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
