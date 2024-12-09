CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  pending_deletion BOOLEAN DEFAULT FALSE,
  deletion_marked_at DATETIME
); 