package n8n

import (
  "bytes"
  "context"
  "encoding/json"
  "fmt"
  "io"
  "log"
  "net/http"
  "strings"
  "time"

  clipsrepo "highlightiq-server/internal/repos/clips"
)

type Client struct {
  webhookURL string
  webhookSecret string
  http       *http.Client
}

func New(webhookURL string, webhookSecret string) *Client {
  return &Client{
    webhookURL: webhookURL,
    webhookSecret: strings.TrimSpace(webhookSecret),
    http: &http.Client{
      Timeout: 30 * time.Second,
    },
  }
}

type PublishPayload struct {
  UserID     int64    `json:"user_id"`
  ClipID      int64    `json:"clip_id"`
  ClipURL     string   `json:"clip_url"`
  Title       string   `json:"title"`
  Description *string  `json:"description,omitempty"`
  Ratio       string   `json:"ratio,omitempty"`
  Tags        []string `json:"tags,omitempty"`
  PrivacyStatus *string `json:"privacy_status,omitempty"`
  AccessToken *string  `json:"access_token,omitempty"`
}

func (c *Client) NotifyClipExported(ctx context.Context, clip clipsrepo.Clip, clipURL string) error {
  if c == nil || c.webhookURL == "" {
    if c == nil {
      log.Printf("n8n notify skipped: client is nil")
    } else {
      log.Printf("n8n notify skipped: webhook url is empty")
    }
    return nil
  }

  payload := PublishPayload{
    UserID:     clip.UserID,
    ClipID:      clip.ID,
    ClipURL:     clipURL,
    Title:       clip.Title,
    Description: clip.Caption,
    Ratio:       "",
    Tags:        nil,
    PrivacyStatus: nil,
  }

  body, err := json.Marshal(payload)
  if err != nil {
    return fmt.Errorf("marshal n8n payload: %w", err)
  }

  req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.webhookURL, bytes.NewReader(body))
  if err != nil {
    return fmt.Errorf("create n8n request: %w", err)
  }
  req.Header.Set("Content-Type", "application/json")
  if c.webhookSecret != "" {
    req.Header.Set("N8N_WEBHOOK_SECRET", c.webhookSecret)
  }

  res, err := c.http.Do(req)
  if err != nil {
    return fmt.Errorf("call n8n webhook: %w", err)
  }
  defer res.Body.Close()

  if res.StatusCode >= 400 {
    b, _ := io.ReadAll(io.LimitReader(res.Body, 8<<10))
    if len(b) > 0 {
      return fmt.Errorf("n8n returned status %d: %s", res.StatusCode, string(b))
    }
    return fmt.Errorf("n8n returned status %d", res.StatusCode)
  }

  return nil
}

func (c *Client) NotifyClipPublish(ctx context.Context, payload PublishPayload) error {
  if c == nil || c.webhookURL == "" {
    if c == nil {
      log.Printf("n8n publish skipped: client is nil")
    } else {
      log.Printf("n8n publish skipped: webhook url is empty")
    }
    return nil
  }

  body, err := json.Marshal(payload)
  if err != nil {
    return fmt.Errorf("marshal n8n payload: %w", err)
  }

  req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.webhookURL, bytes.NewReader(body))
  if err != nil {
    return fmt.Errorf("create n8n request: %w", err)
  }
  log.Printf("n8n publish request: url=%s clip_id=%d", c.webhookURL, payload.ClipID)
  req.Header.Set("Content-Type", "application/json")
  if c.webhookSecret != "" {
    req.Header.Set("N8N_WEBHOOK_SECRET", c.webhookSecret)
  }

  res, err := c.http.Do(req)
  if err != nil {
    return fmt.Errorf("call n8n webhook: %w", err)
  }
  defer res.Body.Close()

  if res.StatusCode >= 400 {
    b, _ := io.ReadAll(io.LimitReader(res.Body, 8<<10))
    if len(b) > 0 {
      return fmt.Errorf("n8n returned status %d: %s", res.StatusCode, string(b))
    }
    return fmt.Errorf("n8n returned status %d", res.StatusCode)
  }

  return nil
}
