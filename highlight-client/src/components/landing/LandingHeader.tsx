import { Link } from "react-router-dom";

const LandingHeader = () => {
  return (
    <header className="flex items-center justify-between px-6 py-6 md:px-12">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="pointer-events-none absolute -top-6 left-2 h-7 w-7 rotate-12 rounded-t-[14px] rounded-b-[6px] bg-gradient-to-b from-[#E94C4C] to-[#B11D1D] shadow-[0_6px_12px_rgba(0,0,0,0.45)]" />
          <div className="pointer-events-none absolute -top-8 left-6 h-4 w-4 rounded-full bg-white shadow-[0_2px_10px_rgba(255,255,255,0.9)]" />
          <div className="pointer-events-none absolute -top-1 left-0 h-3 w-10 rounded-full bg-white shadow-[0_2px_8px_rgba(255,255,255,0.6)]" />
          <img
            src="/images/highlightiq-logo.png"
            alt="HighlightIQ"
            className="h-9 w-auto"
          />
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
