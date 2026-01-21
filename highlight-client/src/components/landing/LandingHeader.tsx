import { Link } from "react-router-dom";

const LandingHeader = () => {
  return (
    <header className="flex items-center justify-between px-6 py-6 md:px-12">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(28,47,255,0.8),rgba(16,18,30,0.9))] text-sm font-semibold text-white shadow-[0_0_30px_rgba(28,47,255,0.45)]">
          H
        </span>
        <div>
          <p className="text-sm font-semibold tracking-wide text-white">HighlightIQ</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
            Highlight engine
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="rounded-full bg-brand-blue px-5 py-2 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(28,47,255,0.35)]"
        >
          Create account
        </Link>
      </div>
    </header>
  );
};

export default LandingHeader;
