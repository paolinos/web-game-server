package main

import (
	"fmt"
	"log/slog"
	"paolinos/web-game-server/web/internal/server"
)

func main() {

	slog.SetLogLoggerLevel(slog.LevelDebug)
	server := server.NewWebServer()

	port := 8000
	slog.Info(fmt.Sprintf("Starting server at port: %d", port))
	server.Run(port)

	// PubSub
}
