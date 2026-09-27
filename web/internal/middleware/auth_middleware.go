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

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

// Authorization middleware with token
func AuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {

			id, _ := uuid.NewUUID()
			c.Set(models.WEB_CONTEXT_REQUEST_DATA, models.RequestData{
				Id:        fmt.Sprintf("request_id-%s", id.String()),
				Timestamp: time.Now().String(),
			})

			token := c.Request().Header.Get("Authorization")
			if token == "" {
				slog.Debug("Middleware: Missing token")

				return httpherlper.ErrorJsonResponse(c, http.StatusUnauthorized, lang.ERROR_UNAUTHORIZED)
			}

			db := dbpk.GetDbContext()
			userData := db.UserRepo.GetByToken(token)
			if userData == nil {
				slog.Debug("Middleware: Token not found")

				return httpherlper.ErrorJsonResponse(c, http.StatusUnauthorized, lang.ERROR_UNAUTHORIZED)
			}

			c.Set(models.WEB_CONTEXT_USER_DATA, userData)
			return next(c)
		}
	}
}
