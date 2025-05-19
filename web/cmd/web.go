package main

import (
	"fmt"
	"log/slog"
	"paolinos/web-game-server/web/internal"
)

func main() {

	slog.SetLogLoggerLevel(slog.LevelDebug)
	server := internal.NewWebServer()

	port := 8000
	slog.Info(fmt.Sprintf("Starting server at port: %d", port))
	server.Run(port)

	// PubSub
}
