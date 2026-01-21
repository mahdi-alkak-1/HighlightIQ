ALTER TABLE highlightiq.clip_candidates
  ADD COLUMN thumbnail_path VARCHAR(1024) NULL AFTER score;
