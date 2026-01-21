import { AnalyticsSeriesPoint } from "@/types/analytics";

interface AnalyticsChartProps {
  series: AnalyticsSeriesPoint[];
}

const buildPath = (series: AnalyticsSeriesPoint[]) => {
  if (series.length === 0) {
    return "";
  }
  const maxValue = Math.max(...series.map((point) => point.value), 1);
  return series
    .map((point, index) => {
      const x = (index / (series.length - 1)) * 100;
      const y = 100 - (point.value / maxValue) * 100;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

const AnalyticsChart = ({ series }: AnalyticsChartProps) => {
  const path = buildPath(series);
  const maxValue = Math.max(...series.map((point) => point.value), 1);
  const lastPoint = series[series.length - 1];
  const lastValue = lastPoint ? lastPoint.value : 0;
  const lastX = series.length > 1 ? ((series.length - 1) / (series.length - 1)) * 100 : 0;
  const lastY = 100 - (lastValue / maxValue) * 100;

  return (
    <div className="rounded-xl border border-brand-border bg-brand-panel px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Views over time</p>
          <p className="text-xs text-white/50">Published clips performance</p>
        </div>
        <div className="text-[11px] text-white/50">Views</div>
      </div>

      <div className="mt-6 h-44">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="lineGlow" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#1C2FFF" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#1C2FFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1C2FFF" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d={path} fill="none" stroke="url(#lineGlow)" strokeWidth="2" />
          <circle cx={lastX} cy={lastY} r="2.5" fill="#1C2FFF" />
        </svg>
      </div>

      <div className="mt-4 flex justify-between text-[10px] uppercase tracking-[0.2em] text-white/30">
        {series.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsChart;
