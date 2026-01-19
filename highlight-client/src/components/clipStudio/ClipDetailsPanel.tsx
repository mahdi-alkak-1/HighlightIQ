import { captionStyles, hashtagOptions } from "@/data/clipStudioData";

interface ClipDetailsPanelProps {
  title: string;
  onTitleChange: (value: string) => void;
  captionStyle: string;
  onCaptionStyleChange: (value: string) => void;
  hashtags: string[];
  onHashtagToggle: (value: string) => void;
}

const ClipDetailsPanel = ({
  title,
  onTitleChange,
  captionStyle,
  onCaptionStyleChange,
  hashtags,
  onHashtagToggle,
}: ClipDetailsPanelProps) => {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-panel p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
          Clip Title
        </p>
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="mt-2 w-full rounded-md border border-brand-border bg-white/5 px-3 py-2 text-sm text-white outline-none"
          placeholder="Clip title"
        />
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
          Caption Style
        </p>
        <div className="mt-3 flex items-center gap-2">
          {captionStyles.map((style) => {
            const isActive = captionStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onCaptionStyleChange(style.id)}
                className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "border-brand-blue bg-brand-blue/15 text-brand-blue"
                    : "border-brand-border bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
          Hashtags
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {hashtagOptions.map((tag) => {
            const active = hashtags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onHashtagToggle(tag)}
                className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${
                  active
                    ? "border-brand-blue bg-brand-blue/15 text-brand-blue"
                    : "border-brand-border bg-white/5 text-white/60"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="mt-3 text-[11px] font-semibold text-brand-link"
        >
          + Add
        </button>
      </div>
    </div>
  );
};

export default ClipDetailsPanel;
