ALTER TABLE recordings
  MODIFY status ENUM('uploaded','processing','ready','failed') NOT NULL DEFAULT 'uploaded';
