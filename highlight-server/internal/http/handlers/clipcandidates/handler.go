package clipcandidates

import (
	"context"
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"highlightiq-server/internal/http/middleware"
	"highlightiq-server/internal/http/response"
	candidatesrepo "highlightiq-server/internal/repos/clipcandidates"
	reqs "highlightiq-server/internal/requests/clipcandidates"
	svc "highlightiq-server/internal/services/clipcandidates"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
)

type Service interface {
	DetectAndStore(ctx context.Context, userID int64, in svc.DetectInput) (int64, error)
	ListByRecordingUUID(ctx context.Context, userID int64, recordingUUID string) ([]candidatesrepo.Candidate, error)
	GetByIDForUser(ctx context.Context, userID int64, id int64) (candidatesrepo.Candidate, error)
	UpdateStatus(ctx context.Context, id int64, status string) error
	Delete(ctx context.Context, id int64) error
}

type Handler struct {
	svc Service
}

func New(s Service) *Handler {
	return &Handler{svc: s}
}

// POST /recordings/{uuid}/clip-candidates/detect
func (h *Handler) Detect(w http.ResponseWriter, r *http.Request) {
	u, ok := middleware.GetAuthUser(r.Context())
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]string{"message": "unauthorized"})
		return
	}

	recordingUUID := chi.URLParam(r, "uuid")

	var req reqs.DetectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil && err != io.EOF {
		response.JSON(w, http.StatusBadRequest, map[string]string{"message": "invalid JSON payload"})
		return
	}

	if err := req.Validate(); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]string{"message": "validation failed"})
		return
	}

	inserted, err := h.svc.DetectAndStore(r.Context(), u.ID, svc.DetectInput{
		RecordingUUID:      recordingUUID,
		MaxClipSeconds:     req.MaxClipSeconds,
		PreRollSeconds:     req.PreRollSeconds,
		PostRollSeconds:    req.PostRollSeconds,
		MinClipSeconds:     req.MinClipSeconds,
		SampleFPS:          req.SampleFPS,
		MaxCandidates:      req.MaxCandidates,
		MinSpacingSeconds:  req.MinSpacingSeconds,
		MergeGapSeconds:    req.MergeGapSeconds,
		ElimMatchThreshold: req.ElimMatchThreshold,
		MinConsecutiveHits: req.MinConsecutiveHits,
		CooldownSeconds:    req.CooldownSeconds,
	})

	if err != nil {
		if err == svc.ErrNotFound {
			response.JSON(w, http.StatusNotFound, map[string]string{"message": "recording not found"})
			return
		}
		log.Printf("DetectAndStore failed: %v", err)
		response.JSON(w, http.StatusInternalServerError, map[string]string{"message": "failed to detect candidates"})
		return
	}

	response.JSON(w, http.StatusCreated, map[string]int64{
		"inserted": inserted,
	})
}

// GET /recordings/{uuid}/clip-candidates
func (h *Handler) ListByRecording(w http.ResponseWriter, r *http.Request) {
	u, ok := middleware.GetAuthUser(r.Context())
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]string{"message": "unauthorized"})
		return
	}

	recordingUUID := chi.URLParam(r, "uuid")

	items, err := h.svc.ListByRecordingUUID(r.Context(), u.ID, recordingUUID)
	if err != nil {
		if err == svc.ErrNotFound {
			response.JSON(w, http.StatusNotFound, map[string]string{"message": "recording not found"})
			return
		}
		response.JSON(w, http.StatusInternalServerError, map[string]string{"message": "failed to list candidates"})
		return
	}

	// strict type response (no any)
	type resp struct {
		Items interface{} `json:"items"`
	}
	response.JSON(w, http.StatusOK, resp{Items: items})
}

// PATCH /clip-candidates/{id}
func (h *Handler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]string{"message": "invalid id"})
		return
	}

	var req reqs.UpdateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]string{"message": "invalid JSON payload"})
		return
	}
	if err := req.Validate(); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]string{"message": "validation failed"})
		return
	}

	if err := h.svc.UpdateStatus(r.Context(), id, req.Status); err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]string{"message": "failed to update status"})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DELETE /clip-candidates/{id}
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]string{"message": "invalid id"})
		return
	}

	if err := h.svc.Delete(r.Context(), id); err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]string{"message": "failed to delete candidate"})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Thumbnail(w http.ResponseWriter, r *http.Request) {
	u, ok := middleware.GetAuthUser(r.Context())
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]string{"message": "unauthorized"})
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]string{"message": "invalid id"})
		return
	}

	cand, err := h.svc.GetByIDForUser(r.Context(), u.ID, id)
	if err != nil {
		response.JSON(w, http.StatusNotFound, map[string]string{"message": "not found"})
		return
	}

	if cand.ThumbnailPath == nil || *cand.ThumbnailPath == "" {
		response.JSON(w, http.StatusConflict, map[string]string{"message": "thumbnail not ready"})
		return
	}

	f, err := os.Open(*cand.ThumbnailPath)
	if err != nil {
		if os.IsNotExist(err) {
			response.JSON(w, http.StatusNotFound, map[string]string{"message": "file not found"})
			return
		}
		response.JSON(w, http.StatusInternalServerError, map[string]string{"message": "failed to open file"})
		return
	}
	defer f.Close()

	info, err := f.Stat()
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]string{"message": "failed to stat file"})
		return
	}

	w.Header().Set("Content-Type", "image/jpeg")
	w.Header().Set("Content-Disposition", "inline; filename=\""+filepath.Base(*cand.ThumbnailPath)+"\"")
	http.ServeContent(w, r, filepath.Base(*cand.ThumbnailPath), info.ModTime(), f)
}
