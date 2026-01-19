package recordings

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"highlightiq-server/internal/http/middleware"
	"highlightiq-server/internal/http/response"
	recRepo "highlightiq-server/internal/repos/recordings"
	recReq "highlightiq-server/internal/requests/recordings"
	clipcand "highlightiq-server/internal/services/clipcandidates"
)

type RecordingService interface {
	Create(ctx context.Context, userID int64, title string, game string, originalName string, fileBytes []byte) (recRepo.Recording, error)
	List(ctx context.Context, userID int64) ([]recRepo.Recording, error)
	Get(ctx context.Context, userID int64, recUUID string) (recRepo.Recording, error)
	UpdateTitle(ctx context.Context, userID int64, recUUID string, title string) error
	Delete(ctx context.Context, userID int64, recUUID string) error
}

type CandidateDetector interface {
	DetectAndStore(ctx context.Context, userID int64, in clipcand.DetectInput) (int64, error)
}

type Handler struct {
	svc RecordingService
	detector CandidateDetector
}

func New(svc RecordingService, detector CandidateDetector) *Handler {
	return &Handler{svc: svc, detector: detector}
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	u, ok := middleware.GetAuthUser(r.Context())
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]any{"message": "unauthorized"})
		return
	}

	// 1GB hard limit
	r.Body = http.MaxBytesReader(w, r.Body, 1_000_000_000)

	if err := r.ParseMultipartForm(32 << 20); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"message": "invalid multipart form"})
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		response.JSON(w, http.StatusUnprocessableEntity, map[string]any{
			"message": "validation error",
			"errors":  map[string]string{"file": "file is required"},
		})
		return
	}
	defer file.Close()

	title := strings.TrimSpace(r.FormValue("title"))
	gameRaw := strings.TrimSpace(r.FormValue("game"))
	game := strings.ToLower(gameRaw)
	var gameLabel string
	switch game {
	case "fortnite":
		gameLabel = "Fortnite"
	case "valorant":
		gameLabel = "Valorant"
	default:
		response.JSON(w, http.StatusUnprocessableEntity, map[string]any{
			"message": "validation error",
			"errors":  map[string]string{"game": "game must be fortnite or valorant"},
		})
		return
	}

	b, err := io.ReadAll(file)
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"message": "failed to read file"})
		return
	}

	rec, err := h.svc.Create(r.Context(), u.ID, title, gameLabel, header.Filename, b)
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "internal server error"})
		return
	}

	if h.detector != nil {
		recUUID := rec.UUID
		userID := u.ID
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
			defer cancel()
			_, _ = h.detector.DetectAndStore(ctx, userID, clipcand.DetectInput{
				RecordingUUID: recUUID,
			})
		}()
	}

	response.JSON(w, http.StatusCreated, rec)
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	u, ok := middleware.GetAuthUser(r.Context())
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]any{"message": "unauthorized"})
		return
	}

	recs, err := h.svc.List(r.Context(), u.ID)
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "internal server error"})
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{"data": recs})
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	u, ok := middleware.GetAuthUser(r.Context())
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]any{"message": "unauthorized"})
		return
	}

	recUUID := chi.URLParam(r, "uuid")
	rec, err := h.svc.Get(r.Context(), u.ID, recUUID)
	if err != nil {
		if errors.Is(err, recRepo.ErrNotFound) {
			response.JSON(w, http.StatusNotFound, map[string]any{"message": "not found"})
			return
		}
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "internal server error"})
		return
	}

	response.JSON(w, http.StatusOK, rec)
}

func (h *Handler) UpdateTitle(w http.ResponseWriter, r *http.Request) {
	u, ok := middleware.GetAuthUser(r.Context())
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]any{"message": "unauthorized"})
		return
	}

	recUUID := chi.URLParam(r, "uuid")

	var req recReq.UpdateTitleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"message": "invalid JSON payload"})
		return
	}
	if err := req.Validate(); err != nil {
		if verr, ok := err.(recReq.ValidationError); ok {
			response.JSON(w, http.StatusUnprocessableEntity, map[string]any{
				"message": "validation error",
				"errors":  verr,
			})
			return
		}
		response.JSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "validation error"})
		return
	}

	if err := h.svc.UpdateTitle(r.Context(), u.ID, recUUID, req.Title); err != nil {
		if errors.Is(err, recRepo.ErrNotFound) {
			response.JSON(w, http.StatusNotFound, map[string]any{"message": "not found"})
			return
		}
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "internal server error"})
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{"message": "ok"})
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	u, ok := middleware.GetAuthUser(r.Context())
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]any{"message": "unauthorized"})
		return
	}

	recUUID := chi.URLParam(r, "uuid")

	if err := h.svc.Delete(r.Context(), u.ID, recUUID); err != nil {
		if errors.Is(err, recRepo.ErrNotFound) {
			response.JSON(w, http.StatusNotFound, map[string]any{"message": "not found"})
			return
		}
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "internal server error"})
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{"message": "deleted"})
}

func (h *Handler) Thumbnail(w http.ResponseWriter, r *http.Request) {
	u, ok := middleware.GetAuthUser(r.Context())
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]any{"message": "unauthorized"})
		return
	}

	recUUID := chi.URLParam(r, "uuid")
	rec, err := h.svc.Get(r.Context(), u.ID, recUUID)
	if err != nil {
		if errors.Is(err, recRepo.ErrNotFound) {
			response.JSON(w, http.StatusNotFound, map[string]any{"message": "not found"})
			return
		}
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "internal server error"})
		return
	}

	if rec.ThumbnailPath == "" {
		response.JSON(w, http.StatusConflict, map[string]any{"message": "thumbnail not ready"})
		return
	}

	f, err := os.Open(rec.ThumbnailPath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			response.JSON(w, http.StatusNotFound, map[string]any{"message": "file not found"})
			return
		}
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "failed to open file"})
		return
	}
	defer f.Close()

	info, err := f.Stat()
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "failed to stat file"})
		return
	}

	w.Header().Set("Content-Type", "image/jpeg")
	w.Header().Set("Content-Disposition", "inline; filename=\""+filepath.Base(rec.ThumbnailPath)+"\"")
	http.ServeContent(w, r, filepath.Base(rec.ThumbnailPath), info.ModTime(), f)
}

func (h *Handler) Video(w http.ResponseWriter, r *http.Request) {
	u, ok := middleware.GetAuthUser(r.Context())
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]any{"message": "unauthorized"})
		return
	}

	recUUID := chi.URLParam(r, "uuid")
	rec, err := h.svc.Get(r.Context(), u.ID, recUUID)
	if err != nil {
		if errors.Is(err, recRepo.ErrNotFound) {
			response.JSON(w, http.StatusNotFound, map[string]any{"message": "not found"})
			return
		}
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "internal server error"})
		return
	}

	if rec.StoragePath == "" {
		response.JSON(w, http.StatusConflict, map[string]any{"message": "video not ready"})
		return
	}

	f, err := os.Open(rec.StoragePath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			response.JSON(w, http.StatusNotFound, map[string]any{"message": "file not found"})
			return
		}
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "failed to open file"})
		return
	}
	defer f.Close()

	info, err := f.Stat()
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "failed to stat file"})
		return
	}

	w.Header().Set("Content-Type", "video/mp4")
	w.Header().Set("Content-Disposition", "inline; filename=\""+filepath.Base(rec.StoragePath)+"\"")
	http.ServeContent(w, r, filepath.Base(rec.StoragePath), info.ModTime(), f)
}
