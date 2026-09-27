package server

import (
	"context"
	"log/slog"
	"paolinos/web-game-server/web/internal/db"
	"time"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"github.com/labstack/echo/v5"
)

type AuthMessage struct {
	Token string `json:"token"`
}

func readMessage(conn *websocket.Conn, ctx context.Context) (string, error) {
	msgType, data, err := conn.Read(ctx)
	slog.Info("Reading fist message", msgType, data)
	//err = json.Unmarshal([]byte(data), auth)
	if err != nil {
		slog.Warn("Parsing Websocket message", err)
		return "", err
	}
	return string(data), nil
}

func readJsonMessage[T any](conn *websocket.Conn, ctx context.Context, auth *T) error {
	err := wsjson.Read(ctx, conn, &auth)
	if err != nil {
		slog.Warn("Parsing Websocket Json message", err)
		return err
	}
	return nil
}

func websocketHandler(c *echo.Context) error {
	// Upgrade the HTTP connection to WebSocket.
	conn, err := websocket.Accept(c.Response(), c.Request(), &websocket.AcceptOptions{
		// Configure this properly for your application.
		// Don't use InsecureSkipVerify in production unless you
		// intentionally want to allow any Origin.
	})
	if err != nil {
		return err
	}
	defer conn.CloseNow()

	// The client has 10 seconds to send the authentication message.
	authCtx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	// Read first message
	// NOTE: Example to read a string message
	/*
		msg, err := readMessage(conn, authCtx)
		if err != nil {
			_ = conn.Close(
				websocket.StatusPolicyViolation,
				"authentication required",
			)
			return nil
		} else {
			slog.Info("Message received", msg)
		}
	*/

	var auth AuthMessage
	err = readJsonMessage(conn, authCtx, &auth)
	if err != nil {
		_ = conn.Close(
			websocket.StatusPolicyViolation,
			"authentication required",
		)
		return nil
	}

	// Check Token validation
	ctx := c.Request().Context()
	user := db.GetDbContext().UserRepo.GetByToken(auth.Token)
	if user == nil || user.Token != auth.Token {
		slog.Warn("invalid auth code")

		_ = conn.Close(
			websocket.StatusPolicyViolation,
			"invalid auth code",
		)

		return nil
	} else {
		// User is valid
		err = conn.Write(
			ctx,
			websocket.MessageText,
			[]byte("message received"),
		)
		if err != nil {
			return nil
		}
	}

	// Loop to read messages
	for {
		msgType, data, err := conn.Read(ctx)
		if err != nil {
			slog.Error("websocket read error: %v", err)
			return nil
		}

		slog.Info("received: %s", string(data))

		// Example: echo the message back.
		if err := conn.Write(ctx, msgType, data); err != nil {
			slog.Error("websocket write error: %v", err)
			return nil
		}
	}
}
