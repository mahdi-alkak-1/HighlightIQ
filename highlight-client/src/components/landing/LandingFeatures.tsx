import { landingFeatures } from "@/data/landingData";

const LandingFeatures = () => {
  return (
    <section className="px-6 pb-20 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
              Built for highlights
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              Turn raw gameplay into finished shorts.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/60">
            A single workflow covers capture, detection, review, and publishing without
            extra tools.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {landingFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
            >
              <div className="h-9 w-9 rounded-xl bg-brand-blue/20" />
              <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
