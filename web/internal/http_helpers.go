package internal

import (
	"github.com/gin-gonic/gin"
)

func ErrorJsonResponse(c *gin.Context, statusCode int, errorBody string) {
	c.JSON(statusCode, gin.H{
		"error": errorBody,
	})
	c.Abort()
}
