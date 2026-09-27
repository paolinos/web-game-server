package middleware

/*
import (
	"log"
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
)

// SseMiddleware is a middleware that validates the email and sets up SSE headers.
func SseMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		email := c.QueryParam("tmp")
		if email == "" {
			log.Println("SSE Middleware: Email not provided, closing connection.")
			c.Response().WriteHeader(http.StatusUnauthorized)
			return nil
		}

		c.Response().Header().Set("Content-Type", "text/event-stream")
		c.Response().Header().Set("Cache-Control", "no-cache")
		c.Response().Header().Set("Connection", "keep-alive")
		c.Response().Header().Set("Transfer-Encoding", "chunked")

		return next(c)
	}
}

// SseListening is a goroutine that listens for SSE messages and sends them to connected clients.
// TODO: Fix reference to SseCacheData.Message - needs proper channel access pattern based on actual SSE cache structure
func SseListening() {
	for {
		select {
		case msg := <-SseCacheData.Message:
			log.Println("SSE Listening:", msg)
		case <-time.After(1 * time.Second):
			log.Println("SSE Cache is empty, waiting...")
		}
	}
}
*/
