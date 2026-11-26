package db

import (
	"database/sql"
	"fmt"
	"log/slog"

	_ "modernc.org/sqlite"
)

// dbContext holds the active SQL connection and repository instances.
type dbContext struct {
	DB               *sql.DB
	UserRepo         UserRepository
	MatchmakingRepo  MatchmakingRepository
	SseListeningRepo SseListeningRepository
}

var context *dbContext

// InitDb opens the SQLite database at the given DSN, runs migrations, and
// initializes the repository instances. Use ":memory:" for tests.
func InitDb(dsn string) error {
	if dsn == "" {
		dsn = "web.db"
	}

	connectionString := fmt.Sprintf("%s?_pragma=foreign_keys(1)", dsn)
	db, err := sql.Open("sqlite", connectionString)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	if err := runMigrations(db); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	context = &dbContext{
		DB:               db,
		UserRepo:         UserRepository{db: db},
		MatchmakingRepo:  MatchmakingRepository{db: db},
		SseListeningRepo: SseListeningRepository{db: db},
	}

	slog.Info("database initialized", "dsn", dsn)
	return nil
}

// GetDbContext returns the initialized dbContext. It panics if InitDb has not
// been called successfully.
func GetDbContext() *dbContext {
	if context == nil {
		panic("database not initialized: call InitDb before GetDbContext")
	}
	return context
}

func runMigrations(db *sql.DB) error {
	schema := `
CREATE TABLE IF NOT EXISTS USER (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    create_at TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS USER_SESSION (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expire_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USER(id)
);

CREATE TABLE IF NOT EXISTS USER_POINTS (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    points INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USER(id)
);

CREATE TABLE IF NOT EXISTS MATCH (
    id TEXT PRIMARY KEY,
    game TEXT NOT NULL,
    status TEXT NOT NULL,
    required_players INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS USER_MATCH (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at INTEGER NOT NULL,
    FOREIGN KEY (match_id) REFERENCES MATCH(id),
    FOREIGN KEY (user_id) REFERENCES USER(id)
);

CREATE TABLE IF NOT EXISTS GAME (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at INTEGER,
    ended_at INTEGER,
    FOREIGN KEY (match_id) REFERENCES MATCH(id)
);

CREATE INDEX IF NOT EXISTS idx_user_email ON USER(email);
CREATE INDEX IF NOT EXISTS idx_user_token ON USER(token);
CREATE INDEX IF NOT EXISTS idx_match_game_status ON MATCH(game, status);
CREATE INDEX IF NOT EXISTS idx_user_match_match_id ON USER_MATCH(match_id);
CREATE INDEX IF NOT EXISTS idx_user_match_user_id ON USER_MATCH(user_id);
`
	_, err := db.Exec(schema)
	return err
}
