package middleware

import (
	"fmt"
	"log/slog"
	"net/http"

	dbpk "paolinos/web-game-server/web/internal/db"
	httpherlper "paolinos/web-game-server/web/internal/http_helper"
	"paolinos/web-game-server/web/internal/lang"
	"paolinos/web-game-server/web/internal/models"

	"github.com/gin-gonic/gin"
)

type sseConnection struct {
	UserId  string
	Destroy bool
}

var sseConnectionCache = make(chan sseConnection)

// Server-Sent Events middleware
func SseMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// NOTE: Required headers
		c.Writer.Header().Set("Content-Type", "text/event-stream")
		c.Writer.Header().Set("Cache-Control", "no-cache")
		c.Writer.Header().Set("Connection", "keep-alive")
		c.Writer.Header().Set("Transfer-Encoding", "chunked")

		tmp := c.Query("tmp")

		db := dbpk.GetDbContext()
		// TODO: we're using 'tmp' as email and not one usage token. This is not secure, so be aware of this.
		userData := db.UserRepo.GetByEmail(tmp)
		if userData == nil {
			slog.Info(fmt.Sprintf("SSE Middleware: User with email:%s was not found", tmp))
			httpherlper.ErrorJsonResponse(c, http.StatusUnauthorized, lang.ERROR_UNAUTHORIZED)
			return
		}

		// NOTE: add to cache
		//sseData := db.SseDataRepo.Add(userData.Id)

		// !NOTE: To review this struct. This could be only a Message, maybe??
		/*sseData := SseData{
			UserId:  userData.Id,
			Message: make(chan string),
		}*/
		sseData := SseCacheData.Add(userData.Id)
		c.Set(models.WEB_CONTEXT_SSE_DATA, &sseData)

		//httpherlper.SseCache.Add(userData.Id)
		// ?NOTE: add user to know that is listening the SSE.
		db.SseListeningRepo.Add(userData.Id)
		// !NOTE: new sse connection. only used to be destroyed
		sse := sseConnection{
			UserId:  userData.Id,
			Destroy: false,
		}
		sseConnectionCache <- sse
		//httpherlper.CacheSseChannel <- &sseData

		go func() {
			<-c.Writer.CloseNotify()

			sse.Destroy = true
			db.SseListeningRepo.Delete(sse.UserId)
			slog.Debug("Should close SSE %s, %v", sse.UserId, sse)
		}()

		c.Next()
	}
}

// Server-Sent Events listening
func SseListening() {
	for {
		select {
		// Add new available client
		case client := <-sseConnectionCache:
			if client.Destroy {
				slog.Debug(fmt.Sprintf("SSE FORCE DISCONNECT -> user_id: %s", client.UserId))
				// delete(sseChannels, client)
				// close(client.message)
			} else {
				slog.Debug(fmt.Sprintf("SSE CONNECTION -> user_id: %s", client.UserId))
			}
		}
	}
}
