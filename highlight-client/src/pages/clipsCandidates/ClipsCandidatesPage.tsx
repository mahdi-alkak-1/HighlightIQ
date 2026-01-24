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
import { candidatePageSize, maxClipDurationSeconds } from "@/data/clipStudioData";

const ClipsCandidatesPage = () => {
  const {
    candidates,
    selectedCandidateId,
    setSelectedCandidateId,
    activeRecording,
    recordingThumbnail,
    recordingVideo,
    candidateThumbnails,
    timelineStart,
    timelineEnd,
    recordingDuration,
    updateTimelineRange,
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
  const [candidatePage, setCandidatePage] = useState(1);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<"info" | "success" | "error">("info");
  const successRef = useRef<string | null>(null);
  const noticeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const totalCandidates = candidateItems.length;
  const pageCount = Math.max(1, Math.ceil(totalCandidates / candidatePageSize));
  const currentPage = Math.min(candidatePage, pageCount);
  const pageStart = (currentPage - 1) * candidatePageSize;
  const pageEnd = Math.min(pageStart + candidatePageSize, totalCandidates);
  const pagedCandidates = candidateItems.slice(pageStart, pageEnd);
  const rangeLabel =
    totalCandidates === 0 ? "0 of 0" : `${pageStart + 1}-${pageEnd} of ${totalCandidates}`;

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

  useEffect(() => {
    if (candidatePage > pageCount) {
      setCandidatePage(pageCount);
    }
  }, [candidatePage, pageCount]);

  useEffect(() => {
    if (!selectedCandidateId) {
      return;
    }
    const index = candidates.findIndex((candidate) => candidate.id === selectedCandidateId);
    if (index < 0) {
      return;
    }
    const nextPage = Math.floor(index / candidatePageSize) + 1;
    setCandidatePage(nextPage);
  }, [selectedCandidateId, candidates]);

  useEffect(() => {
    if (!activeRecording) {
      setNoticeMessage(null);
      return;
    }

    if (noticeTimeout.current) {
      clearTimeout(noticeTimeout.current);
      noticeTimeout.current = null;
    }

    if (activeRecording.Status === "processing") {
      setNoticeTone("info");
      setNoticeMessage("Creating clip candidates... please wait.");
      return;
    }

    if (activeRecording.Status === "used" && candidates.length > 0) {
      const key = `${activeRecording.ID}-${candidates.length}`;
      if (successRef.current === key) {
        return;
      }
      successRef.current = key;
      setNoticeTone("success");
      setNoticeMessage("Clip candidates successfully created.");
      noticeTimeout.current = setTimeout(() => {
        setNoticeMessage(null);
      }, 10000);
      return;
    }

    setNoticeMessage(null);
  }, [activeRecording?.Status, activeRecording?.ID, candidates.length]);

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

        {noticeMessage && (
          <div
            className={`rounded-lg px-4 py-2 text-sm ${
              noticeTone === "success"
                ? "border border-brand-ready/40 bg-brand-ready/10 text-brand-ready"
                : noticeTone === "error"
                  ? "border border-red-500/40 bg-red-500/10 text-red-200"
                  : "border border-brand-blue/40 bg-brand-blue/10 text-white/80"
            }`}
          >
            {noticeMessage}
          </div>
        )}

        {errorMessage && activeRecording?.Status !== "processing" && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_1fr_280px]">
          <div className="flex flex-col gap-4">
            <CandidateList
              items={pagedCandidates}
              activeId={selectedCandidateId}
              onSelect={setSelectedCandidateId}
              page={currentPage}
              pageCount={pageCount}
              rangeLabel={rangeLabel}
              onPageChange={setCandidatePage}
            />
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
                  onRangeChange={updateTimelineRange}
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
