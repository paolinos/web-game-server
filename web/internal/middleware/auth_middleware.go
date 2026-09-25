package middleware

import (
	"fmt"
	"log/slog"
	"net/http"
	"time"

	dbpk "paolinos/web-game-server/web/internal/db"
	httpherlper "paolinos/web-game-server/web/internal/http_helper"
	"paolinos/web-game-server/web/internal/lang"
	"paolinos/web-game-server/web/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Authorization middleware with token
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		id, _ := uuid.NewUUID()
		c.Set(models.WEB_CONTEXT_REQUEST_DATA, models.RequestData{
			Id:        fmt.Sprintf("request_id-%s", id.String()),
			Timestamp: time.Now().String(),
		})

		token := c.Request.Header.Get("Authorization")
		if token == "" {
			slog.Debug("Middleware: Missing token")

			httpherlper.ErrorJsonResponse(c, http.StatusUnauthorized, lang.ERROR_UNAUTHORIZED)
			return
		}

		db := dbpk.GetDbContext()
		userData := db.UserRepo.GetByToken(token)
		if userData == nil {
			slog.Debug("Middleware: Token not found")

			httpherlper.ErrorJsonResponse(c, http.StatusUnauthorized, lang.ERROR_UNAUTHORIZED)
			return
		}

		c.Set(models.WEB_CONTEXT_USER_DATA, userData)
		c.Next()
	}
}
