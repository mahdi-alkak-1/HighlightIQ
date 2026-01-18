package dashboard

import (
	"context"
	"strconv"
	"time"

	clipcandrepo "highlightiq-server/internal/repos/clipcandidates"
	recordingsrepo "highlightiq-server/internal/repos/recordings"
	yprepo "highlightiq-server/internal/repos/youtubepublishes"
)

type Service struct {
	recordings *recordingsrepo.Repo
	candidates *clipcandrepo.Repo
	publishes  *yprepo.Repo
}

func New(recordings *recordingsrepo.Repo, candidates *clipcandrepo.Repo, publishes *yprepo.Repo) *Service {
	return &Service{recordings: recordings, candidates: candidates, publishes: publishes}
}

type pipelineCounts struct {
	uploadPending  int64
	detecting      int64
	reviewReady    int64
	publishQueued  int64
	publishDone    int64
	publishFailed  int64
	publishDeleted int64
	syncPending    int64
}

func (s *Service) GetPipeline(ctx context.Context, userID int64) (PipelineResponse, error) {
	counts, err := s.loadCounts(ctx, userID)
	if err != nil {
		return PipelineResponse{}, err
	}

	activeID := resolveActiveStage(counts)
	stages := buildStages(counts, activeID)

	return PipelineResponse{Stages: stages}, nil
}

func (s *Service) loadCounts(ctx context.Context, userID int64) (pipelineCounts, error) {
	cutoff := time.Now().Add(-24 * time.Hour)
	_, err := s.candidates.RejectStaleByUser(ctx, userID, cutoff)
	if err != nil {
		return pipelineCounts{}, err
	}

	rec, err := s.recordings.GetLatestByUser(ctx, userID)
	if err != nil {
		if err == recordingsrepo.ErrNotFound {
			return pipelineCounts{}, nil
		}
		return pipelineCounts{}, err
	}

	uploadPending := int64(0)
	if rec.Status == "uploaded" {
		uploadPending = 1
	}

	detecting, err := s.candidates.CountByRecordingAndStatus(ctx, rec.ID, "new")
	if err != nil {
		return pipelineCounts{}, err
	}
	reviewReady, err := s.candidates.CountByRecordingAndStatus(ctx, rec.ID, "approved")
	if err != nil {
		return pipelineCounts{}, err
	}
	publishQueued, err := s.publishes.CountByRecordingAndStatus(ctx, rec.ID, "queued")
	if err != nil {
		return pipelineCounts{}, err
	}
	publishDone, err := s.publishes.CountByRecordingAndStatus(ctx, rec.ID, "uploaded")
	if err != nil {
		return pipelineCounts{}, err
	}
	publishFailed, err := s.publishes.CountByRecordingAndStatus(ctx, rec.ID, "failed")
	if err != nil {
		return pipelineCounts{}, err
	}
	publishDeleted, err := s.publishes.CountByRecordingAndStatus(ctx, rec.ID, "deleted")
	if err != nil {
		return pipelineCounts{}, err
	}
	syncPending, err := s.publishes.CountSyncPendingByRecording(ctx, rec.ID)
	if err != nil {
		return pipelineCounts{}, err
	}

	return pipelineCounts{
		uploadPending:  uploadPending,
		detecting:      detecting,
		reviewReady:    reviewReady,
		publishQueued:  publishQueued,
		publishDone:    publishDone,
		publishFailed:  publishFailed,
		publishDeleted: publishDeleted,
		syncPending:    syncPending,
	}, nil
}

func resolveActiveStage(c pipelineCounts) string {
	if c.detecting > 0 {
		return "detecting"
	}
	if c.reviewReady > 0 {
		return "review"
	}
	if c.publishQueued > 0 {
		return "publish"
	}
	if c.syncPending > 0 {
		return "sync"
	}
	if c.uploadPending > 0 {
		return "upload"
	}
	return ""
}

func buildStages(c pipelineCounts, activeID string) []Stage {
	order := []string{"upload", "detecting", "review", "publish", "sync"}
	activeIndex := -1
	for i, id := range order {
		if id == activeID {
			activeIndex = i
			break
		}
	}

	stages := make([]Stage, 0, len(order))
	for i, id := range order {
		stage := Stage{ID: id}
		switch id {
		case "upload":
			stage.Label = "Upload"
			stage.Count = c.uploadPending
			stage.Status = formatStatus(c.uploadPending, "pending")
		case "detecting":
			stage.Label = "Detecting"
			stage.Count = c.detecting
			stage.Status = formatStatus(c.detecting, "processing")
		case "review":
			stage.Label = "Review"
			stage.Count = c.reviewReady
			stage.Status = formatStatus(c.reviewReady, "ready")
		case "publish":
			stage.Label = "Publish"
			stage.Count = c.publishQueued + c.publishDone
			if c.publishQueued > 0 {
				stage.Status = formatStatus(c.publishQueued, "queued")
			} else if c.publishDone > 0 {
				stage.Status = formatStatus(c.publishDone, "uploaded")
			} else if c.publishFailed > 0 {
				stage.Status = formatStatus(c.publishFailed, "failed")
			} else if c.publishDeleted > 0 {
				stage.Status = formatStatus(c.publishDeleted, "deleted")
			} else {
				stage.Status = "0 queued"
			}
		case "sync":
			stage.Label = "Sync"
			stage.Count = c.syncPending
			stage.Status = formatStatus(c.syncPending, "syncing")
		}

		stage.State = resolveState(i, activeIndex, stage.Count)
		stages = append(stages, stage)
	}

	return stages
}

func resolveState(index int, activeIndex int, count int64) string {
	if activeIndex == -1 {
		if count == 0 {
			return "disabled"
		}
		return "pending"
	}
	if index < activeIndex {
		return "complete"
	}
	if index == activeIndex {
		return "active"
	}
	if count == 0 {
		return "disabled"
	}
	return "pending"
}

func formatStatus(count int64, label string) string {
	return formatCount(count) + " " + label
}

func formatCount(count int64) string {
	return strconv.FormatInt(count, 10)
}
