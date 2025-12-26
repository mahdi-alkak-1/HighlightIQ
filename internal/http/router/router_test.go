package router

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthEndpoint(t *testing.T) {

	h := New()

	req := httptest.NewRequest(http.MethodGet, "/health", nil)

	rr := httptest.NewRecorder()

	h.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
	}

	if rr.Body.String() != "ok" {
		t.Fatalf("expected body %q, got %q", "ok", rr.Body.String())
	}
}
