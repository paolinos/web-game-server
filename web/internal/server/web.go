package server

import (
	"fmt"
	"net/http"
	"os"

	"paolinos/web-game-server/web/internal/middleware"

	"github.com/labstack/echo/v5"
	//echo_middleware "github.com/labstack/echo/v5/middleware"
)

type WebApp struct {
	server *echo.Echo
}

// Healthcheck endpoint
func healthcheck(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"message": "service healthy",
	})
}

func getWorkingDirectory() string {
	path, err := os.Getwd()
	if err != nil {
		return ""
	}
	return path
}

func NewWebServer() *WebApp {
	e := echo.New()

	apiGroup := e.Group("/api")
	apiGroup.Use(middleware.AuthMiddleware())
	{
		apiGroup.GET("/dashboard", dashboardRoute)
		apiGroup.POST("/search-match", searchMatchRoute)
	}
	// TODO: to review later
	//e.GET("/api/match-notification", sendNotificationsRoute, middleware.SseMiddleware())
	//go middleware.SseListening()

	e.GET("/api/healthcheck", healthcheck)
	e.POST("/api/signin", signinRoute)

	// Static and index
	e.Static("/static", getWorkingDirectory()+"/public/static")
	e.File("/", getWorkingDirectory()+"/public/index.html")

	webServer := &WebApp{
		server: e,
	}
	return webServer
}

// Run web server at port
func (w *WebApp) Run(port int) {
	var host = fmt.Sprintf("0.0.0.0:%d", port)
	w.server.Start(host)
}
