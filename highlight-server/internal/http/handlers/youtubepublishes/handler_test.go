package youtubepublishes

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"highlightiq-server/internal/http/middleware"
	yprepo "highlightiq-server/internal/repos/youtubepublishes"
	reqs "highlightiq-server/internal/requests/youtubepublishes"
	svc "highlightiq-server/internal/services/youtubepublishes"
)

type fakeYoutubeService struct {
	createdForClip int64
	internalClipID int64
}

func (f *fakeYoutubeService) Create(ctx context.Context, userID int64, clipID int64, in svc.CreateInput) (yprepo.YoutubePublish, error) {
	f.createdForClip = clipID
	return yprepo.YoutubePublish{ID: 1, ClipID: clipID}, nil
}
func (f *fakeYoutubeService) CreateInternal(ctx context.Context, clipID int64, in svc.CreateInput) (yprepo.YoutubePublish, error) {
	f.internalClipID = clipID
	return yprepo.YoutubePublish{ID: 2, ClipID: clipID}, nil
}
func (f *fakeYoutubeService) ListByClip(ctx context.Context, userID int64, clipID int64) ([]yprepo.YoutubePublish, error) {
	return []yprepo.YoutubePublish{{ID: 3, ClipID: clipID}}, nil
}
func (f *fakeYoutubeService) ListVideoIDs(ctx context.Context) ([]string, error) { return []string{"abc"}, nil }
func (f *fakeYoutubeService) GetByVideoID(ctx context.Context, youtubeVideoID string) (yprepo.YoutubePublish, error) {
	return yprepo.YoutubePublish{ID: 4, YoutubeVideoID: youtubeVideoID}, nil
}
func (f *fakeYoutubeService) MarkDeletedByVideoID(ctx context.Context, youtubeVideoID string, lastSyncedAt *time.Time) (yprepo.YoutubePublish, error) {
	return yprepo.YoutubePublish{ID: 5, YoutubeVideoID: youtubeVideoID, Status: "deleted"}, nil
}
func (f *fakeYoutubeService) Update(ctx context.Context, userID int64, id int64, in svc.UpdateInput) (yprepo.YoutubePublish, error) {
	return yprepo.YoutubePublish{ID: id}, nil
}
func (f *fakeYoutubeService) UpdateByVideoID(ctx context.Context, youtubeVideoID string, in svc.UpdateInput) (yprepo.YoutubePublish, error) {
	return yprepo.YoutubePublish{ID: 6, YoutubeVideoID: youtubeVideoID}, nil
}

func TestCreatePublish(t *testing.T) {
	svc := &fakeYoutubeService{}
	handler := New(svc, "secret")

	router := chi.NewRouter()
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := middleware.WithAuthUser(r.Context(), middleware.AuthUser{ID: 1, UUID: "user-1"})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	})
	router.Post("/clips/{id}/youtube-publishes", handler.Create)

	body, _ := json.Marshal(reqs.CreateRequest{
		YoutubeVideoID: "abc",
		YoutubeURL:     "https://youtube.com/watch?v=abc",
	})
	req := httptest.NewRequest(http.MethodPost, "/clips/99/youtube-publishes", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, rr.Code)
	}
	if svc.createdForClip != 99 {
		t.Fatalf("expected clip id to be forwarded")
	}
}

func TestInternalCreatePublish(t *testing.T) {
	svc := &fakeYoutubeService{}
	handler := New(svc, "secret")

	router := chi.NewRouter()
	router.Post("/internal/youtube-publishes", handler.InternalCreate)

	body, _ := json.Marshal(reqs.InternalCreateRequest{
		ClipID:         123,
		YoutubeVideoID: "abc",
		YoutubeURL:     "https://youtube.com/watch?v=abc",
	})
	req := httptest.NewRequest(http.MethodPost, "/internal/youtube-publishes", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-N8N-SECRET", "secret")

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, rr.Code)
	}
	if svc.internalClipID != 123 {
		t.Fatalf("expected internal clip id to be forwarded")
	}
}
