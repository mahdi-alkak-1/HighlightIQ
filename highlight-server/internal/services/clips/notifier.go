package clips

import (
	"context"

	"highlightiq-server/internal/integrations/n8n"
	clipsrepo "highlightiq-server/internal/repos/clips"
)

type PublishNotifier interface {
	NotifyClipExported(ctx context.Context, clip clipsrepo.Clip, clipURL string) error
	NotifyClipPublish(ctx context.Context, payload n8n.PublishPayload) error
}
