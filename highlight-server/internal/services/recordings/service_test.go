package recordings

import "testing"

func TestSanitizeFileName(t *testing.T) {
	got := sanitizeFileName(`..\evil\path\my video?.mp4`)
	if got == "" || got == "upload.mp4" {
		t.Fatalf("expected sanitized name, got %q", got)
	}
	if got != "my_video.mp4" {
		t.Fatalf("unexpected sanitized output: %q", got)
	}
}

func TestFilenameNoExt(t *testing.T) {
	if got := filenameNoExt("clip_01.mp4"); got != "clip_01" {
		t.Fatalf("unexpected name: %q", got)
	}
}
