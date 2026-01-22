import { landingMetrics } from "@/data/landingData";

const LandingMetrics = () => {
  return (
    <section className="px-6 pb-20 md:px-12">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 via-white/0 to-white/5 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
              Momentum
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              Keep your channel in motion.
            </h3>
            <p className="mt-3 max-w-md text-sm text-white/60">
              Stay consistent with automated outputs and clear performance signals.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {landingMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5"
              >
                <p className="text-2xl font-semibold text-white">{metric.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/50">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingMetrics;
