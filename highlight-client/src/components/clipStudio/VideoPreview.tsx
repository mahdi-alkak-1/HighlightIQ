import { RefObject } from "react";

interface VideoPreviewProps {
  src: string | null;
  title: string;
  videoRef: RefObject<HTMLVideoElement>;
}

const VideoPreview = ({ src, title, videoRef }: VideoPreviewProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-panel">
      {src ? (
        <video
          ref={videoRef}
          src={src}
          className="h-44 w-full object-cover"
          controls
        />
      ) : (
        <div className="flex h-44 items-center justify-center text-xs text-white/50">
          Video unavailable
        </div>
      )}
      <div className="border-t border-brand-border px-3 py-2 text-xs text-white/60">
        {title}
      </div>
    </div>
  );
};

export default VideoPreview;
