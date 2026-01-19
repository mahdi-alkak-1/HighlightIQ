ALTER TABLE recordings
  ADD COLUMN thumbnail_path VARCHAR(255) NULL AFTER storage_path;
