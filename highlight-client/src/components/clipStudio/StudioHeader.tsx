interface StudioHeaderProps {
  isGenerateDisabled: boolean;
  isPublishDisabled: boolean;
  isGenerating: boolean;
  isPublishing: boolean;
  hasGeneratedClip: boolean;
  onGenerate: () => void;
  onPublish: () => void;
}

const StudioHeader = ({
  isGenerateDisabled,
  isPublishDisabled,
  isGenerating,
  isPublishing,
  hasGeneratedClip,
  onGenerate,
  onPublish,
}: StudioHeaderProps) => {
  const generateLabel = hasGeneratedClip ? "Clip Ready" : isGenerating ? "Generating..." : "Generate Clip";
  const publishLabel = isPublishing ? "Publishing..." : "Publish Selected";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Clips Studio</h1>
        <p className="text-xs text-white/50">Editing and publish 1 selected clip at a time.</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerateDisabled}
          className={`rounded-lg px-4 py-2 text-xs font-semibold ${
            isGenerateDisabled
              ? "cursor-not-allowed bg-white/10 text-white/40"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {generateLabel}
        </button>
        <button
          type="button"
          onClick={onPublish}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold ${
            isPublishDisabled
              ? "cursor-not-allowed bg-brand-blue/30 text-white/50"
              : "bg-brand-blue text-white"
          }`}
        >
          {publishLabel}
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
            <path d="M3 8h9m0 0L8 4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StudioHeader;
