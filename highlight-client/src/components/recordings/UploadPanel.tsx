import { ChangeEvent } from "react";
import { gameOptions } from "@/data/recordingsOptions";

interface UploadPanelProps {
  title: string;
  game: string;
  fileName?: string;
  isUploading: boolean;
  progress: number;
  onTitleChange: (value: string) => void;
  onGameChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
}

const UploadPanel = ({
  title,
  game,
  fileName,
  isUploading,
  progress,
  onTitleChange,
  onGameChange,
  onFileChange,
  onUpload,
}: UploadPanelProps) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileChange(file);
  };

  return (
    <section className="grid grid-cols-1 gap-4 rounded-xl border border-brand-border bg-brand-panel p-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M12 16V8m0 0l-3 3m3-3l3 3M5 16v3h14v-3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-semibold">New Upload</span>
        </div>

        <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-[#141821] text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d="M12 16V8m0 0l-3 3m3-3l3 3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-white">Drop mp4 here</p>
          <p className="text-xs text-white/50">Max file size 1Gb. Supported mp4</p>
          <label className="cursor-pointer rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20">
            Select File
            <input type="file" accept="video/mp4" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-white/50">File Metadata</p>
        </div>

        <label className="flex flex-col gap-2 text-xs text-white/70">
          <span>Game</span>
          <select
            className="rounded-lg border border-brand-border bg-[#141821] px-3 py-2 text-sm text-white/80 outline-none"
            value={game}
            onChange={(event) => onGameChange(event.target.value)}
          >
            {gameOptions.map((option) => (
              <option className="bg-[#1B202A]" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-xs text-white/70">
          <span>Title</span>
          <input
            className="rounded-lg border border-brand-border bg-[#141821] px-3 py-2 text-sm text-white/80 outline-none"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Give the recording a name"
          />
        </label>

        <div className="rounded-lg border border-brand-border bg-[#141821] px-4 py-3 text-xs text-white/70">
          <div className="flex items-center justify-between">
            <span className="truncate">{fileName ?? "No file selected"}</span>
            {fileName && !isUploading && (
              <button className="text-white/40 hover:text-white" type="button" onClick={() => onFileChange(null)}>
                ×
              </button>
            )}
          </div>
          {isUploading && (
            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <div className="h-1.5 rounded-full bg-brand-blue" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-[10px] text-white/50">Uploading... {progress}%</p>
            </div>
          )}
        </div>

        <button
          className="w-full rounded-md bg-brand-blue px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled={!fileName || isUploading}
          onClick={onUpload}
        >
          {isUploading ? "Uploading..." : "Upload Recording"}
        </button>
      </div>
    </section>
  );
};

export default UploadPanel;
