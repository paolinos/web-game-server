package internal

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type WebApp struct {
	server *gin.Engine
}

// GET / => return static web
// POST /api/signin => email, password , return token
// GET /api/dashboard => return user information, username, points, etc.
// GET /api/sse => SSE for match maker. return event when have the mach maker have already the min players
// POST /api/search-mack => game: tictactoe
// Routes
func healthcheck(c *gin.Context) {
	c.JSON(200, gin.H{
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
	apiGroup.Use(authMiddleware())
	{
		apiGroup.GET("/dashboard", dashboardRoute)
		apiGroup.POST("/search-match", searchMatchRoute)
	}
	s.GET("/api/match-notification", sseMiddleware(), sendNotificationsRoute)
	go seeListening()

	s.GET("/api/healthcheck", healthcheck)
	s.POST("/api/signin", signinRoute)
	s.Static("/static", getWorkingDirectory()+"/public/static")

	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))

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

func (w *WebApp) Run(port int) {
	var host = fmt.Sprintf("0.0.0.0:%d", port)
	w.server.Run(host)
}
