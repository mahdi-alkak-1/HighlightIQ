interface ClipDetailsPanelProps {
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

const ClipDetailsPanel = ({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
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
          Description
        </p>
        <textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          rows={6}
          className="mt-3 w-full resize-none rounded-md border border-brand-border bg-white/5 px-3 py-2 text-xs text-white outline-none"
          placeholder="Write a short description..."
        />
      </div>
    </div>
  );
};

export default ClipDetailsPanel;
