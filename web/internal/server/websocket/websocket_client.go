package ws_server

import (
	"context"
	"encoding/json"
	"log/slog"
	"sync"
	"time"

	"github.com/coder/websocket"
	"github.com/google/uuid"
)

// WebSocketConn is an interface for WebSocket connections to enable testing
type WebSocketConn interface {
	Write(ctx context.Context, msgType websocket.MessageType, data []byte) error
	Read(ctx context.Context) (websocket.MessageType, []byte, error)
	CloseNow()
}

// WebsocketClient represents a single WebSocket connection with methods for sending/receiving messages
type WebsocketClient struct {
	socketId    string        // Unique identifier for the connection (UUID v4)
	userId      string        // User identifier from authentication
	username    string        // Username from authentication
	conn        WebSocketConn // Reference to the WebSocket connection (interface for testability)
	receiveDone chan struct{} // Channel for graceful shutdown of receive routine
	doneOnce    sync.Once     // Ensures receiveDone is closed only once
}

// NewWebsocketClient creates a new WebsocketClient instance with a generated socket ID
func NewWebsocketClient(conn WebSocketConn, userId string, username string) *WebsocketClient {
	socketId := uuid.New().String()
	return &WebsocketClient{
		socketId:    socketId,
		userId:      userId,
		username:    username,
		conn:        conn,
		receiveDone: make(chan struct{}),
	}
}

// Send sends a string message to the WebSocket connection
func (c *WebsocketClient) Send(msg string) error {
	if c.conn == nil {
		return nil // Connection already closed
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := c.conn.Write(ctx, websocket.MessageText, []byte(msg))

	if err != nil {
		slog.Error("Failed to send message", "socket_id", c.socketId, "error", err)
	}
	return err
}

// SendJson marshals an object to JSON and sends it to the WebSocket connection
func (c *WebsocketClient) SendJson(obj any) error {
	if c.conn == nil {
		return nil // Connection already closed
	}

	data, err := json.Marshal(obj)
	if err != nil {
		slog.Error("Failed to marshal JSON", "socket_id", c.socketId, "error", err)
		return err
	}

	err = c.Send(string(data))
	if err != nil {
		slog.Error("Failed to send JSON message", "socket_id", c.socketId, "error", err)
	}
	return err
}

// ReceiveRoutine starts a goroutine that reads messages from the WebSocket connection
// and calls the provided function for each received message.
// The routine stops automatically when the connection closes or receiveDone is closed.
func (c *WebsocketClient) ReceiveRoutine(fn func(msg string)) {
	go func() {
		defer c.doneOnce.Do(func() { close(c.receiveDone) })

		for {
			select {
			case <-c.receiveDone:
				return
			default:
				msgType, data, err := c.conn.Read(context.Background())
				if err != nil {
					slog.Error("WebSocket read error", "socket_id", c.socketId, "error", err)
					return
				}

				// Only handle text messages
				if msgType == websocket.MessageText {
					// Call the provided function for each received message
					go fn(string(data))
				}
			}
		}
	}()
}

// Disconnect closes the WebSocket connection with a reason (optional message)
// The reason is logged but never sent to clients before disconnection.
func (c *WebsocketClient) Disconnect(reason string) {
	if c.conn == nil {
		return // Connection already closed
	}

	slog.Info("Disconnecting WebSocket", "socket_id", c.socketId, "reason", reason)
	c.conn.CloseNow()
	c.conn = nil
}
