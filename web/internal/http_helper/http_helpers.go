package httpherlper

import (
	"github.com/labstack/echo/v5"
)

func ErrorJsonResponse(c *echo.Context, statusCode int, errorBody string) error {
	return c.JSON(statusCode, map[string]string{
		"error": errorBody,
	})
}
