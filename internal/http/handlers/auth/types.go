package auth

import (
	"context"

	authsvc "highlightiq-server/internal/services/auth"
)

type RegisterService interface {
	Register(ctx context.Context, in authsvc.RegisterInput) (authsvc.RegisterOutput, error)
}

type Handler struct {
	svc RegisterService
}

func New(svc RegisterService) *Handler {
	return &Handler{svc: svc}
}
