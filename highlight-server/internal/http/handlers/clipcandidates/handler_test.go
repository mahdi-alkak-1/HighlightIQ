package clipcandidates

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"highlightiq-server/internal/http/middleware"
	candidatesrepo "highlightiq-server/internal/repos/clipcandidates"
	reqs "highlightiq-server/internal/requests/clipcandidates"
	svc "highlightiq-server/internal/services/clipcandidates"
)

type fakeCandidatesService struct {
	lastDetect svc.DetectInput
}

func (f *fakeCandidatesService) DetectAndStore(ctx context.Context, userID int64, in svc.DetectInput) (int64, error) {
	f.lastDetect = in
	return 3, nil
}

func (f *fakeCandidatesService) ListByRecordingUUID(ctx context.Context, userID int64, recordingUUID string) ([]candidatesrepo.Candidate, error) {
	return []candidatesrepo.Candidate{{ID: 1, RecordingID: 2, Status: "new"}}, nil
}

func (f *fakeCandidatesService) GetByIDForUser(ctx context.Context, userID int64, id int64) (candidatesrepo.Candidate, error) {
	return candidatesrepo.Candidate{ID: id, RecordingID: 2, Status: "new"}, nil
}

func (f *fakeCandidatesService) UpdateStatus(ctx context.Context, id int64, status string) error {
	return nil
}

func (f *fakeCandidatesService) Delete(ctx context.Context, id int64) error {
	return nil
}

func TestDetectCandidates(t *testing.T) {
	svc := &fakeCandidatesService{}
	handler := New(svc)

	router := chi.NewRouter()
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := middleware.WithAuthUser(r.Context(), middleware.AuthUser{ID: 1, UUID: "user-1"})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	})
	router.Post("/recordings/{uuid}/clip-candidates/detect", handler.Detect)

	body, _ := json.Marshal(reqs.DetectRequest{})
	req := httptest.NewRequest(http.MethodPost, "/recordings/rec-1/clip-candidates/detect", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, rr.Code)
	}
	if svc.lastDetect.RecordingUUID != "rec-1" {
		t.Fatalf("expected recording uuid to be set")
	}
}

func TestListCandidates(t *testing.T) {
	handler := New(&fakeCandidatesService{})

	router := chi.NewRouter()
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := middleware.WithAuthUser(r.Context(), middleware.AuthUser{ID: 1, UUID: "user-1"})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	})
	router.Get("/recordings/{uuid}/clip-candidates", handler.ListByRecording)

	req := httptest.NewRequest(http.MethodGet, "/recordings/rec-1/clip-candidates", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
	}
}
