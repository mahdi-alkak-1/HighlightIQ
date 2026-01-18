ALTER TABLE clips
  ADD COLUMN thumbnail_path VARCHAR(255) NULL AFTER export_path;
