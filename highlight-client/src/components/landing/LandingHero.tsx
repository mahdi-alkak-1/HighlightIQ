import { Link } from "react-router-dom";

const LandingHero = () => {
  return (
    <section className="relative px-6 pb-20 pt-16 md:px-12">
      <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-brand-blue/15 blur-[120px]" />
      <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-white/5 blur-[120px]" />
      <div className="relative mx-auto max-w-5xl">
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-white md:text-6xl">
          Turn every session into a
          <span className="block text-brand-blue"> highlight reel that posts itself.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/70">
          HighlightIQ detects the best moments, slices them into short-form clips, and
          pushes them to your audience with a single pipeline.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/register"
            className="rounded-full bg-brand-blue px-6 py-3 text-xs font-semibold text-white shadow-[0_16px_40px_rgba(28,47,255,0.35)]"
          >
            Start free
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-white/15 px-6 py-3 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
          >
            I already have an account
          </Link>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Live pipeline
            </p>
            <div className="mt-4 space-y-4">
              {[
                "Upload gameplay",
                "Detect highlights",
                "Review picks",
                "Publish to YouTube",
              ].map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 text-[10px] text-white/70">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-white">{label}</p>
                    <div className="mt-2 h-[2px] rounded-full bg-white/10">
                      <div className="h-[2px] w-3/4 rounded-full bg-brand-blue" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Pipeline snapshot
            </p>
            <div className="mt-5 space-y-4">
              {[
                { label: "Upload", note: "Gameplay ingested" },
                { label: "Detect", note: "Highlights extracted" },
                { label: "Review", note: "Pick best clips" },
                { label: "Publish", note: "Push to YouTube" },
              ].map((stage) => (
                <div key={stage.label} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-brand-blue" />
                  <div className="flex-1">
                    <p className="text-sm text-white">{stage.label}</p>
                    <p className="text-xs text-white/50">{stage.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-white/50">
              Every step stays visible so creators always know what is next.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
