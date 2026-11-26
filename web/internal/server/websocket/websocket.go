package ws_server

import (
	"context"
	"log/slog"
	"time"

	parser "paolinos/web-game-server/web/internal/business/websocket"
	"paolinos/web-game-server/web/internal/db"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"github.com/labstack/echo/v5"
)

type AuthMessage struct {
	Token string `json:"token"`
}

func WebsocketHandler(c *echo.Context) error {
	// Upgrade the HTTP connection to WebSocket.
	conn, err := websocket.Accept(c.Response(), c.Request(), &websocket.AcceptOptions{
		// Configure this properly for your application.
		// Don't use InsecureSkipVerify in production unless you
		// intentionally want to allow any Origin.
	})
	if err != nil {
		return err
	}

	// The client has 10 seconds to send the authentication message.
	authCtx, cancel := context.WithTimeout(
		c.Request().Context(),
		10*time.Second,
	)
	defer cancel()

	var auth AuthMessage
	err = wsjson.Read(authCtx, conn, &auth)
	if err != nil {
		slog.Warn("Parsing Websocket Json message", "error", err)
		_ = conn.Close(
			websocket.StatusPolicyViolation,
			"authentication required",
		)
		return nil
	}

	// Check Token validation
	user := db.GetDbContext().UserRepo.GetByToken(auth.Token)
	if user == nil || user.Token != auth.Token {
		slog.Warn("invalid auth code")

		_ = conn.Close(
			websocket.StatusPolicyViolation,
			"invalid auth code",
		)

		return nil
	}

	// Register the authenticated client and start its lifecycle routines.
	manager := GetWebsocketManager()
	client := manager.Add(conn, user.Id, user.Username)

	if err := client.SendJson(map[string]any{
		"type":     "connected",
		"socketId": client.GetSocketId(),
	}); err != nil {
		manager.Remove(client.GetSocketId())
		client.Disconnect("failed to send connected message")
		return nil
	}

	client.ReceiveRoutine(messageHandler)
	client.PingRoutine()

	// Block until the receive routine detects the connection has closed.
	<-client.receiveDone

	manager.Remove(client.GetSocketId())
	client.Disconnect("connection closed")
	return nil
}

func messageHandler(c WebsocketClientSender, msg string) {
	slog.Info("websocket message received", "socket_id", c.GetSocketId(), "msg", msg)

	parsed, err := parser.ParseMessage([]byte(msg))
	if err != nil {
		slog.Warn("failed to parse websocket message", "socket_id", c.GetSocketId(), "error", err)
		return
	}

	msgType, ok := parsed["type"].(string)
	if !ok {
		slog.Warn("websocket message missing type", "socket_id", c.GetSocketId())
		return
	}

	slog.Info("parsed websocket message", "socket_id", c.GetSocketId(), "type", msgType)

	switch msgType {
	case MessageTypeMatchSearch:
		HandleMatchSearch(c, msg)
	default:
		slog.Debug("unhandled websocket message type", "socket_id", c.GetSocketId(), "type", msgType)
	}
}
