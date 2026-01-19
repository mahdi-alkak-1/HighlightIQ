package recordings

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/google/uuid"

	recRepo "highlightiq-server/internal/repos/recordings"
)

type Service struct {
	repo     *recRepo.Repo
	baseDir  string
	maxBytes int64
	ffmpegPath string
}

func New(repo *recRepo.Repo, baseDir string) *Service {
	if baseDir == "" {
		baseDir = "./storage/recordings"
	}
	return &Service{
		repo:     repo,
		baseDir:  baseDir,
		maxBytes: 1_000_000_000, // 1GB
		ffmpegPath: resolveFFmpegPath(),
	}
}

func (s *Service) Create(ctx context.Context, userID int64, title string, game string, originalName string, fileBytes []byte) (recRepo.Recording, error) {
	recUUID := uuid.NewString()

	if title == "" {
		title = filenameNoExt(originalName)
	}

	if err := os.MkdirAll(s.baseDir, 0o755); err != nil {
		return recRepo.Recording{}, err
	}

	fileName := recUUID + "_" + sanitizeFileName(originalName)
	fullPath := filepath.Join(s.baseDir, fileName)

	if err := os.WriteFile(fullPath, fileBytes, 0o644); err != nil {
		return recRepo.Recording{}, err
	}

	thumbnailPath, err := s.generateThumbnail(ctx, fullPath, recUUID)
	if err != nil {
		_ = os.Remove(fullPath)
		return recRepo.Recording{}, err
	}

	rec, err := s.repo.Create(ctx, recRepo.CreateParams{
		UUID:            recUUID,
		UserID:          userID,
		Title:           title,
		Game:            game,
		OriginalName:    originalName,
		StoragePath:     fullPath,
		ThumbnailPath:   thumbnailPath,
		DurationSeconds: 0,
		Status:          "uploaded",
	})
	if err != nil {
		// If DB insert fails, clean up the saved file
		_ = os.Remove(fullPath)
		if thumbnailPath != "" {
			_ = os.Remove(thumbnailPath)
		}
		return recRepo.Recording{}, err
	}

	return rec, nil
}

func (s *Service) List(ctx context.Context, userID int64) ([]recRepo.Recording, error) {
	return s.repo.ListByUser(ctx, userID)
}

func (s *Service) Get(ctx context.Context, userID int64, recUUID string) (recRepo.Recording, error) {
	return s.repo.GetByUUIDForUser(ctx, userID, recUUID, 0)
}

func (s *Service) UpdateTitle(ctx context.Context, userID int64, recUUID string, title string) error {
	if title == "" {
		return recRepo.ErrNotFound // will be mapped to 422 by handler; keep it simple
	}
	return s.repo.UpdateTitleByUUIDForUser(ctx, userID, recUUID, title)
}

func (s *Service) Delete(ctx context.Context, userID int64, recUUID string) error {
	path, err := s.repo.DeleteByUUIDForUser(ctx, userID, recUUID)
	if err != nil {
		return err
	}
	// Best-effort file delete (if it fails, DB row is already gone)
	_ = os.Remove(path)
	return nil
}

func sanitizeFileName(name string) string {
	name = filepath.Base(name)
	name = strings.ReplaceAll(name, " ", "_")
	// remove dangerous path chars
	name = strings.Map(func(r rune) rune {
		switch r {
		case '\\', '/', ':', '*', '?', '"', '<', '>', '|':
			return -1
		default:
			return r
		}
	}, name)
	if name == "" {
		return "upload.mp4"
	}
	return name
}

func filenameNoExt(name string) string {
	base := filepath.Base(name)
	ext := filepath.Ext(base)
	return strings.TrimSuffix(base, ext)
}

func resolveFFmpegPath() string {
	if v := strings.TrimSpace(os.Getenv("FFMPEG_PATH")); v != "" {
		if st, err := os.Stat(v); err == nil && st.IsDir() {
			if runtime.GOOS == "windows" {
				return filepath.Join(v, "ffmpeg.exe")
			}
			return filepath.Join(v, "ffmpeg")
		}
		return v
	}

	if p, err := exec.LookPath("ffmpeg"); err == nil {
		return p
	}
	if runtime.GOOS == "windows" {
		if p, err := exec.LookPath("ffmpeg.exe"); err == nil {
			return p
		}
	}
	return "ffmpeg"
}

func (s *Service) generateThumbnail(ctx context.Context, videoPath string, recUUID string) (string, error) {
	if s.ffmpegPath == "ffmpeg" || s.ffmpegPath == "ffmpeg.exe" {
		s.ffmpegPath = resolveFFmpegPath()
	}
	if strings.EqualFold(filepath.Base(s.ffmpegPath), "ffmpeg") || strings.EqualFold(filepath.Base(s.ffmpegPath), "ffmpeg.exe") {
		if _, err := exec.LookPath(s.ffmpegPath); err != nil && !filepath.IsAbs(s.ffmpegPath) {
			return "", fmt.Errorf("ffmpeg not found: %w", err)
		}
	}

	thumbDir := `D:\recordings\images`
	if err := os.MkdirAll(thumbDir, 0o755); err != nil {
		return "", err
	}

	outPath := filepath.Join(thumbDir, recUUID+".jpg")
	cmd := exec.CommandContext(ctx, s.ffmpegPath,
		"-hide_banner",
		"-loglevel", "error",
		"-y",
		"-ss", "0",
		"-i", videoPath,
		"-frames:v", "1",
		"-q:v", "2",
		outPath,
	)
	cmd.Env = os.Environ()

	out, runErr := cmd.CombinedOutput()
	if runErr != nil {
		msg := strings.TrimSpace(string(out))
		if msg == "" {
			msg = runErr.Error()
		}
		return "", fmt.Errorf("thumbnail generation failed: %s", msg)
	}

	return outPath, nil
}

// Optional helper if you want to format time later
func formatTime(t time.Time) string {
	return t.Format(time.RFC3339)
}
