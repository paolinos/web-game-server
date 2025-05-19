package internal

import (
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Authorization middleware with token
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, _ := uuid.NewUUID()
		c.Set(WEB_CONTEXT_REQUEST_DATA, requestData{
			id:        fmt.Sprintf("request_id-%s", id.String()),
			timestamp: time.Now().String(),
		})

		token := c.Request.Header.Get("Authorization")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})
			c.Abort()
			return
		}

		pos := slices.IndexFunc(users, func(c *fakeUserData) bool { return c.token == token })
		if pos == -1 {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Middleware - Unauthorized. Invalid token",
			})
			c.Abort()
			return
		}

		c.Set(WEB_CONTEXT_USER_DATA, users[pos])
		c.Next()
	}
}

var sseChannels = make(chan *sseData)

// Server-sent events middleware
func sseMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// NOTE: Required headers
		c.Writer.Header().Set("Content-Type", "text/event-stream")
		c.Writer.Header().Set("Cache-Control", "no-cache")
		c.Writer.Header().Set("Connection", "keep-alive")
		c.Writer.Header().Set("Transfer-Encoding", "chunked")

		tmp := c.Query("tmp")
		// TODO: we're using 'tmp' as email and not one usage token. This is not secure, so be aware of this.
		pos := slices.IndexFunc(users, func(c *fakeUserData) bool { return c.email == tmp })
		if pos == -1 {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Middleware - Unauthorized. Invalid token",
			})
			c.Abort()
			return
		}
		userData := users[pos]

		sseData := &sseData{
			user_id: userData.id,
			message: make(chan string),
			destroy: false,
		}
		sseDatas = append(sseDatas, sseData)
		c.Set(WEB_CONTEXT_SSE_DATA, sseData)
		sseChannels <- sseData

		go func() {
			<-c.Writer.CloseNotify()

			sseData.destroy = true
			slog.Debug("Should close SSE %s, %v", sseData.user_id, sseData)
		}()

		c.Next()
	}
}

func seeListening() {
	for {
		select {
		// Add new available client
		case client := <-sseChannels:
			if client.destroy {
				slog.Debug("SSE FORCE DISCONNECT -> user_id: %s", client.user_id)
				// delete(sseChannels, client)
				// close(client.message)
			} else {
				slog.Debug("SSE CONNECTION -> user_id: %s", client.user_id)
			}
		}
	}
}
