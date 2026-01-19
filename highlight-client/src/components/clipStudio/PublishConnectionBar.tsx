interface PublishConnectionBarProps {
  connected: boolean;
  onToggle: (value: boolean) => void;
}

const PublishConnectionBar = ({ connected, onToggle }: PublishConnectionBarProps) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-panel px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-500" fill="currentColor">
            <path d="M21.58 7.19a2.75 2.75 0 0 0-1.93-1.95C17.86 4.75 12 4.75 12 4.75s-5.86 0-7.65.49A2.75 2.75 0 0 0 2.42 7.2 28.7 28.7 0 0 0 2 12a28.7 28.7 0 0 0 .42 4.81 2.75 2.75 0 0 0 1.93 1.95c1.79.49 7.65.49 7.65.49s5.86 0 7.65-.49a2.75 2.75 0 0 0 1.93-1.95A28.7 28.7 0 0 0 22 12a28.7 28.7 0 0 0-.42-4.81Z" />
            <path fill="#0b1220" d="M10.2 15.2V8.8L15.7 12l-5.5 3.2Z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Publishing to YouTube Shorts</p>
          <p className="text-xs text-white/50">
            {connected ? "Channel: HighlightIQ Gaming" : "Disconnected"}
          </p>
        </div>
        <span
          className={`ml-2 rounded-full px-2 py-1 text-[10px] font-semibold ${
            connected ? "bg-brand-ready/20 text-brand-ready" : "bg-white/10 text-white/50"
          }`}
        >
          {connected ? "CONNECTED" : "OFF"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/50">Export file only</span>
        <button
          type="button"
          onClick={() => onToggle(!connected)}
          className={`relative h-6 w-11 rounded-full transition ${
            connected ? "bg-brand-blue" : "bg-white/20"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
              connected ? "right-1" : "left-1"
            }`}
          />
        </button>
        <button type="button" className="text-xs font-semibold text-brand-link">
          Change Settings
        </button>
      </div>
    </div>
  );
};

export default PublishConnectionBar;
