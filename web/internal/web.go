package internal

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"paolinos/web-game-server/web/internal/middleware"

	"github.com/gin-gonic/gin"
)

type WebApp struct {
	server *gin.Engine
}

// Healthcheck endpoint
func healthcheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
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

	s := gin.Default()

	apiGroup := s.Group("/api")
	apiGroup.Use(middleware.AuthMiddleware())
	{
		apiGroup.GET("/dashboard", dashboardRoute)
		apiGroup.POST("/search-match", searchMatchRoute)
	}
	s.GET("/api/match-notification", middleware.SseMiddleware(), sendNotificationsRoute)
	go middleware.SseListening()

	s.GET("/api/healthcheck", healthcheck)
	s.POST("/api/signin", signinRoute)
	s.Static("/static", getWorkingDirectory()+"/public/static")

	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))

	// Return index page
	s.GET("/", func(c *gin.Context) {
		var mainErr error
		defer func() {
			if mainErr != nil {
				logger.Error("Error trying to load the index.html", mainErr)
				c.Data(http.StatusNotFound, "text/html; charset=utf-8", []byte("There is an error. try later"))
				return
			}
		}()

		data, err := os.ReadFile(getWorkingDirectory() + "/public/index.html")
		if err != nil {
			mainErr = err
			return
		}

		c.Header("Content-Type", "text/html")
		_, err = c.Writer.Write(data)
		if err != nil {
			mainErr = err
		}
	})

	webServer := &WebApp{
		server: s,
	}
	return webServer
}

// Run web server at port
func (w *WebApp) Run(port int) {
	var host = fmt.Sprintf("0.0.0.0:%d", port)
	w.server.Run(host)
}
