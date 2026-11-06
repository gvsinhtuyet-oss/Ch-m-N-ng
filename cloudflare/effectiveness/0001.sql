-- Analytics only. This database is independent of the learning and account stores.
CREATE TABLE IF NOT EXISTS report_sessions (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  audience INTEGER NOT NULL CHECK (audience BETWEEN 0 AND 2)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS report_sessions_day ON report_sessions(day, audience);

CREATE TABLE IF NOT EXISTS report_station_sessions (
  session_id TEXT NOT NULL REFERENCES report_sessions(id) ON DELETE CASCADE,
  station_id TEXT NOT NULL,
  day TEXT NOT NULL,
  stage INTEGER NOT NULL CHECK (stage BETWEEN 0 AND 4),
  PRIMARY KEY (session_id, station_id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS report_station_day ON report_station_sessions(day, station_id);
