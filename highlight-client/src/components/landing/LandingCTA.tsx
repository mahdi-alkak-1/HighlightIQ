import { Link } from "react-router-dom";

const LandingCTA = () => {
  return (
    <section className="px-6 pb-24 md:px-12">
      <div className="mx-auto max-w-5xl rounded-3xl border border-brand-blue/40 bg-[linear-gradient(135deg,rgba(28,47,255,0.25),rgba(17,19,24,0.9))] p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
              Ready to ship
            </p>
            <h3 className="mt-3 text-3xl font-semibold text-white">
              Launch your next highlight set today.
            </h3>
            <p className="mt-3 text-sm text-white/70">
              Upload one session and let HighlightIQ take it from there.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-full bg-white px-6 py-3 text-xs font-semibold text-[#0c0f16]"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/40 px-6 py-3 text-xs font-semibold text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;
