package main

import (
	"fmt"
	"paolinos/web-game-server/web/internal"
)

func main() {
	fmt.Println("Hello, World!")

	// Esto lo tiene que hacer el Web Server
	// GET / => return static web
	// POST /api/signin => email, password , return token
	// GET /api/dashboard => return user information, username, points, etc.
	// GET /api/sse => SSE for match maker. return event when have the mach maker have already the min players
	// POST /api/search-mack => game: tictactoe

	server := internal.NewWebServer()

	server.Run(8000)

	// PubSub
}
