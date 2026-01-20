import { useEffect, useMemo, useRef, useState } from "react";
import CandidateList from "@/components/clipStudio/CandidateList";
import ClipDetailsPanel from "@/components/clipStudio/ClipDetailsPanel";
import PreviewPanel from "@/components/clipStudio/PreviewPanel";
import PublishConnectionBar from "@/components/clipStudio/PublishConnectionBar";
import PublishModal from "@/components/clipStudio/PublishModal";
import StudioHeader from "@/components/clipStudio/StudioHeader";
import VideoPreview from "@/components/clipStudio/VideoPreview";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useClipStudio } from "@/hooks/useClipStudio";
import { maxClipDurationSeconds } from "@/data/clipStudioData";

const ClipsCandidatesPage = () => {
  const {
    candidates,
    selectedCandidateId,
    setSelectedCandidateId,
    recordingThumbnail,
    recordingVideo,
    candidateThumbnails,
    timelineStart,
    timelineEnd,
    recordingDuration,
    updateTimelineStart,
    updateTimelineEnd,
    clipTitle,
    setClipTitle,
    selectedClip,
    isGenerating,
    isPublishing,
    publishConnected,
    setPublishConnected,
    publishRequested,
    modalMessage,
    setModalMessage,
    hasGeneratedClip,
    isPublishReady,
    handleGenerate,
    handlePublish,
    isLoading,
    errorMessage,
  } = useClipStudio();

  const [description, setDescription] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const previewImage =
    (selectedCandidateId ? candidateThumbnails[selectedCandidateId] : null) ??
    recordingThumbnail ??
    "/images/register-hero.png";

  const timelineDuration = Math.max(1, Math.round(timelineEnd - timelineStart));

  const candidateItems = useMemo(
    () =>
      candidates.map((candidate) => ({
        id: candidate.id,
        title: candidate.label,
        timeLabel: candidate.timeLabel,
        thumbnail: candidateThumbnails[candidate.id] ?? previewImage,
      })),
    [candidates, candidateThumbnails, previewImage]
  );

  const isGenerateDisabled = !selectedCandidateId || isGenerating || hasGeneratedClip;
  const isPublishDisabled = !selectedCandidateId || !isPublishReady || publishRequested;

  useEffect(() => {
    const player = videoRef.current;
    if (!player) {
      return;
    }
    player.currentTime = timelineStart;
  }, [timelineStart, recordingVideo, selectedCandidateId]);

  useEffect(() => {
    setDescription(selectedClip?.caption ?? "");
  }, [selectedClip?.id]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <StudioHeader
          isGenerateDisabled={isGenerateDisabled}
          isPublishDisabled={isPublishDisabled}
          isGenerating={isGenerating}
          isPublishing={isPublishing}
          hasGeneratedClip={hasGeneratedClip}
          onGenerate={() => handleGenerate(description)}
          onPublish={() =>
            handlePublish({
              title: clipTitle || "Clip Title",
              description: description.trim(),
              privacyStatus: "unlisted",
            })
          }
        />

        {errorMessage && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_1fr_280px]">
          <div className="flex flex-col gap-4">
            <CandidateList items={candidateItems} activeId={selectedCandidateId} onSelect={setSelectedCandidateId} />
          </div>

          <div>
            {isLoading ? (
              <div className="rounded-xl border border-brand-border bg-brand-panel px-6 py-10 text-sm text-white/60">
                Loading candidates...
              </div>
            ) : (
              <div className="space-y-4">
                <VideoPreview src={recordingVideo} title={clipTitle || "Recording preview"} videoRef={videoRef} />
                <PreviewPanel
                  start={timelineStart}
                  end={timelineEnd}
                  duration={timelineDuration}
                  maxDuration={maxClipDurationSeconds}
                  totalDuration={Math.max(1, recordingDuration)}
                  onStartChange={updateTimelineStart}
                  onEndChange={updateTimelineEnd}
                />
              </div>
            )}
          </div>

          <ClipDetailsPanel
            title={clipTitle}
            onTitleChange={setClipTitle}
            description={description}
            onDescriptionChange={setDescription}
          />
        </div>

        <PublishConnectionBar connected={publishConnected} onToggle={setPublishConnected} />
      </div>

      {modalMessage && <PublishModal message={modalMessage} onClose={() => setModalMessage(null)} />}
    </DashboardLayout>
  );
};

export default ClipsCandidatesPage;
