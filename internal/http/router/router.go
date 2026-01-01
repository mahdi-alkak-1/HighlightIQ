package router

import (
	"net/http"

	authhandlers "highlightiq-server/internal/http/handlers/auth"
	recordinghandlers "highlightiq-server/internal/http/handlers/recordings"

	"github.com/go-chi/chi/v5"
)

func New(
	authHandler *authhandlers.Handler,
	recordingsHandler *recordinghandlers.Handler,
	authMiddleware func(http.Handler) http.Handler,
) http.Handler {
	r := chi.NewRouter()

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	if authHandler != nil {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)
		})
	}

	// Protected routes
	if recordingsHandler != nil && authMiddleware != nil {
		r.With(authMiddleware).Route("/recordings", func(r chi.Router) {
			r.Post("/", recordingsHandler.Create)
			r.Get("/", recordingsHandler.List)
			r.Get("/{uuid}", recordingsHandler.Get)
			r.Patch("/{uuid}", recordingsHandler.UpdateTitle)
			r.Delete("/{uuid}", recordingsHandler.Delete)
		})
	}

	return r
}
