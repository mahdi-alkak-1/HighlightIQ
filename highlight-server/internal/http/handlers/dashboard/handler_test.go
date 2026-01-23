package dashboard

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"highlightiq-server/internal/http/middleware"
	dashsvc "highlightiq-server/internal/services/dashboard"
)

type fakeDashboardService struct{}

func (fakeDashboardService) GetPipeline(ctx context.Context, userID int64) (dashsvc.PipelineResponse, error) {
	return dashsvc.PipelineResponse{
		Stages: []dashsvc.Stage{
			{ID: "upload", Label: "Upload", Status: "0 pending", Count: 0, State: "disabled"},
		},
	}, nil
}

func TestPipeline(t *testing.T) {
	handler := New(fakeDashboardService{})
	router := chi.NewRouter()
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := middleware.WithAuthUser(r.Context(), middleware.AuthUser{ID: 1, UUID: "user-1"})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	})
	router.Get("/dashboard/pipeline", handler.Pipeline)

	req := httptest.NewRequest(http.MethodGet, "/dashboard/pipeline", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
	}
}
