package recordings

import (
	"strings"
	"testing"
)

func TestSanitizeFileName(t *testing.T) {
	got := sanitizeFileName(`..\evil\path\my video?.mp4`)
	if got == "" || got == "upload.mp4" {
		t.Fatalf("expected sanitized name, got %q", got)
	}
	if strings.ContainsAny(got, `\\/:*?"<>| `) {
		t.Fatalf("expected sanitized output without special chars, got %q", got)
	}
	if !strings.HasSuffix(got, ".mp4") {
		t.Fatalf("expected mp4 suffix, got %q", got)
	}
}

func TestFilenameNoExt(t *testing.T) {
	if got := filenameNoExt("clip_01.mp4"); got != "clip_01" {
		t.Fatalf("unexpected name: %q", got)
	}
}
