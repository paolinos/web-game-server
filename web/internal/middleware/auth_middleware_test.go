package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"paolinos/web-game-server/web/internal/db"
	"paolinos/web-game-server/web/internal/models"

	"github.com/labstack/echo/v5"
	"github.com/stretchr/testify/assert"
)

func setupAuthMiddlewareTest() (*echo.Echo, db.UserRepository, func()) {
	e := echo.New()

	ctx := db.GetDbContext()
	originalUserRepo := ctx.UserRepo

	userRepo := db.UserRepository{}
	userRepo.Add("user-id-1", "test@example.com", "test-user", "valid-token")

	ctx.UserRepo = userRepo

	cleanup := func() {
		ctx.UserRepo = originalUserRepo
	}

	return e, userRepo, cleanup
}

func TestAuthMiddleware(t *testing.T) {
	t.Run("Given a request without an Authorization header, when AuthMiddleware runs, then it returns 401 Unauthorized", func(t *testing.T) {
		e, _, cleanup := setupAuthMiddlewareTest()
		defer cleanup()

		req := httptest.NewRequest(http.MethodGet, "/api/dashboard", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		nextCalled := false
		next := func(c *echo.Context) error {
			nextCalled = true
			return c.String(http.StatusOK, "ok")
		}

		err := AuthMiddleware()(next)(c)

		assert.NoError(t, err)
		assert.False(t, nextCalled, "next handler should not be called")
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})

	t.Run("Given a request with an invalid Authorization token, when AuthMiddleware runs, then it returns 401 Unauthorized", func(t *testing.T) {
		e, _, cleanup := setupAuthMiddlewareTest()
		defer cleanup()

		req := httptest.NewRequest(http.MethodGet, "/api/dashboard", nil)
		req.Header.Set("Authorization", "invalid-token")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		nextCalled := false
		next := func(c *echo.Context) error {
			nextCalled = true
			return c.String(http.StatusOK, "ok")
		}

		err := AuthMiddleware()(next)(c)

		assert.NoError(t, err)
		assert.False(t, nextCalled, "next handler should not be called")
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})

	t.Run("Given a request with a valid Authorization token, when AuthMiddleware runs, then it sets the user data and calls the next handler", func(t *testing.T) {
		e, _, cleanup := setupAuthMiddlewareTest()
		defer cleanup()

		req := httptest.NewRequest(http.MethodGet, "/api/dashboard", nil)
		req.Header.Set("Authorization", "valid-token")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		nextCalled := false
		next := func(c *echo.Context) error {
			nextCalled = true
			return c.String(http.StatusOK, "ok")
		}

		err := AuthMiddleware()(next)(c)

		assert.NoError(t, err)
		assert.True(t, nextCalled, "next handler should be called")
		assert.Equal(t, http.StatusOK, rec.Code)

		userData := c.Get(models.WEB_CONTEXT_USER_DATA)
		assert.NotNil(t, userData)

		user, ok := userData.(*models.FakeUserData)
		assert.True(t, ok)
		assert.Equal(t, "user-id-1", user.Id)
		assert.Equal(t, "test-user", user.Username)
		assert.Equal(t, "valid-token", user.Token)
	})
}
