ALTER TABLE recordings
  MODIFY status ENUM('uploaded','processing','used','failed') NOT NULL DEFAULT 'uploaded';
