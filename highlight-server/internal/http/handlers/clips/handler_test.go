package clips

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"highlightiq-server/internal/http/middleware"
	clipsrepo "highlightiq-server/internal/repos/clips"
	reqs "highlightiq-server/internal/requests/clips"
	svc "highlightiq-server/internal/services/clips"
)

type fakeClipsService struct {
	createdInput svc.CreateInput
}

func (f *fakeClipsService) Create(ctx context.Context, userID int64, in svc.CreateInput) (clipsrepo.Clip, error) {
	f.createdInput = in
	return clipsrepo.Clip{
		ID:         10,
		UserID:     userID,
		Title:      in.Title,
		StartMS:    in.StartMS,
		EndMS:      in.EndMS,
		Status:     "ready",
		RecordingID: 1,
	}, nil
}
func (f *fakeClipsService) List(ctx context.Context, userID int64, recordingUUID *string) ([]clipsrepo.Clip, error) {
	return []clipsrepo.Clip{{ID: 1, UserID: userID, Title: "clip"}}, nil
}
func (f *fakeClipsService) Get(ctx context.Context, userID int64, id int64) (clipsrepo.Clip, error) {
	return clipsrepo.Clip{ID: id, UserID: userID, Title: "clip"}, nil
}
func (f *fakeClipsService) Update(ctx context.Context, userID int64, id int64, in svc.UpdateInput) (clipsrepo.Clip, error) {
	return clipsrepo.Clip{ID: id, UserID: userID, Title: "updated"}, nil
}
func (f *fakeClipsService) Delete(ctx context.Context, userID int64, id int64) error {
	return nil
}
func (f *fakeClipsService) Export(ctx context.Context, userID int64, id int64) (clipsrepo.Clip, error) {
	return clipsrepo.Clip{ID: id, UserID: userID, Title: "exported"}, nil
}
func (f *fakeClipsService) Publish(ctx context.Context, userID int64, id int64, in svc.PublishInput) error {
	return nil
}
func (f *fakeClipsService) GetExport(ctx context.Context, userID int64, id int64) (string, string, error) {
	return "", "", nil
}
func (f *fakeClipsService) GetThumbnail(ctx context.Context, userID int64, id int64) (string, string, error) {
	return "", "", nil
}

func withAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := middleware.WithAuthUser(r.Context(), middleware.AuthUser{ID: 1, UUID: "user-1"})
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func TestCreateClip(t *testing.T) {
	svc := &fakeClipsService{}
	handler := New(svc)

	router := chi.NewRouter()
	router.Use(withAuth)
	router.Post("/clips", handler.Create)

	body, _ := json.Marshal(reqs.CreateRequest{
		RecordingUUID: "rec-1",
		Title:         "My Clip",
		StartMS:       1000,
		EndMS:         4000,
	})
	req := httptest.NewRequest(http.MethodPost, "/clips", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, rr.Code)
	}
	if svc.createdInput.RecordingUUID != "rec-1" {
		t.Fatalf("expected recording uuid to be passed")
	}
}

func TestCreateClipRejectsInvalidRange(t *testing.T) {
	handler := New(&fakeClipsService{})
	router := chi.NewRouter()
	router.Use(withAuth)
	router.Post("/clips", handler.Create)

	body, _ := json.Marshal(reqs.CreateRequest{
		RecordingUUID: "rec-1",
		Title:         "Bad Clip",
		StartMS:       5000,
		EndMS:         4000,
	})
	req := httptest.NewRequest(http.MethodPost, "/clips", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rr.Code)
	}
}
