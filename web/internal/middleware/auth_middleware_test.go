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

func setupAuthMiddlewareTest(t *testing.T) (*echo.Echo, func()) {
	e := echo.New()

	if err := db.InitDb(":memory:"); err != nil {
		t.Fatalf("failed to init db: %v", err)
	}

	t.Cleanup(func() {
		ctx := db.GetDbContext()
		_ = ctx.DB.Close()
	})

	return e, func() {}
}

func TestAuthMiddleware(t *testing.T) {
	t.Run("Given a request without an Authorization header, when AuthMiddleware runs, then it returns 401 Unauthorized", func(t *testing.T) {
		e, _ := setupAuthMiddlewareTest(t)

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
		e, _ := setupAuthMiddlewareTest(t)

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
		e, _ := setupAuthMiddlewareTest(t)

		_, err := db.GetDbContext().UserRepo.Add("user-id-1", "test@example.com", "test-user", "valid-token")
		assert.NoError(t, err)

		req := httptest.NewRequest(http.MethodGet, "/api/dashboard", nil)
		req.Header.Set("Authorization", "valid-token")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		nextCalled := false
		next := func(c *echo.Context) error {
			nextCalled = true
			return c.String(http.StatusOK, "ok")
		}

		err = AuthMiddleware()(next)(c)

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
