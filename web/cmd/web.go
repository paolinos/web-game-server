package main

import (
	"fmt"
	"log/slog"
	"os"

	"paolinos/web-game-server/web/internal/db"
	"paolinos/web-game-server/web/internal/server"
)

func main() {

	slog.SetLogLoggerLevel(slog.LevelDebug)

	dsn := os.Getenv("WEB_DB_DSN")
	if dsn == "" {
		dsn = "web.db"
	}
	if err := db.InitDb(dsn); err != nil {
		slog.Error("failed to initialize database", "error", err)
		os.Exit(1)
	}

	server := server.NewWebServer()

	port := 8000
	slog.Info(fmt.Sprintf("Starting server at port: %d", port))
	server.Run(port)

	// PubSub
}
