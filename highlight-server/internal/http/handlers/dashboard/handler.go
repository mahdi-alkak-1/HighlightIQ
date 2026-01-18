package dashboard

import (
	"context"
	"net/http"

	"highlightiq-server/internal/http/middleware"
	"highlightiq-server/internal/http/response"
	dashsvc "highlightiq-server/internal/services/dashboard"
)

type Service interface {
	GetPipeline(ctx context.Context, userID int64) (dashsvc.PipelineResponse, error)
}

type Handler struct {
	svc Service
}

func New(svc Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Pipeline(w http.ResponseWriter, r *http.Request) {
	u, ok := middleware.GetAuthUser(r.Context())
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]any{"message": "unauthorized"})
		return
	}

	out, err := h.svc.GetPipeline(r.Context(), u.ID)
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"message": "failed to load pipeline"})
		return
	}

	response.JSON(w, http.StatusOK, out)
}
