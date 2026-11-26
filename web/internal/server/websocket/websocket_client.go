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

const (
	pingInterval   = 15 * time.Second
	pingTimeoutMax = 10 * time.Second
)

// WebsocketClientConfig allows injection of ping/pong timing for testing.
type WebsocketClientConfig struct {
	PingInterval   time.Duration
	PingTimeoutMax time.Duration
}

// WebSocketConn is an interface for WebSocket connections to enable testing
type WebSocketConn interface {
	Write(ctx context.Context, msgType websocket.MessageType, data []byte) error
	Read(ctx context.Context) (websocket.MessageType, []byte, error)
	CloseNow() error
}

// WebsocketClient represents a single WebSocket connection with methods for sending/receiving messages
type WebsocketClient struct {
	socketId       string        // Unique identifier for the connection (UUID v4)
	userId         string        // User identifier from authentication
	username       string        // Username from authentication
	conn           WebSocketConn // Reference to the WebSocket connection (interface for testability)
	receiveDone    chan struct{} // Channel for graceful shutdown of receive routine
	done           chan struct{} // Channel closed when the client is disconnected
	disconnected   bool          // Flag to ensure Disconnect is idempotent
	mu             sync.Mutex    // Protects conn and disconnected flag
	pingTimeout    time.Time     // When the last ping was sent; timeout deadline
	pingMu         sync.Mutex    // Protects pingTimeout
	pingInterval   time.Duration // Interval between ping messages
	pingTimeoutMax time.Duration // Max time to wait for a pong after a ping
}

// NewWebsocketClient creates a new WebsocketClient instance with a generated socket ID
func NewWebsocketClient(conn WebSocketConn, userId string, username string) *WebsocketClient {
	return NewWebsocketClientWithConfig(conn, userId, username, WebsocketClientConfig{})
}

// NewWebsocketClientWithConfig creates a new WebsocketClient with configurable ping/pong timing.
func NewWebsocketClientWithConfig(conn WebSocketConn, userId string, username string, config WebsocketClientConfig) *WebsocketClient {
	socketId := uuid.New().String()

	pi := config.PingInterval
	if pi <= 0 {
		pi = pingInterval
	}
	ptm := config.PingTimeoutMax
	if ptm <= 0 {
		ptm = pingTimeoutMax
	}

	return &WebsocketClient{
		socketId:       socketId,
		userId:         userId,
		username:       username,
		conn:           conn,
		receiveDone:    make(chan struct{}),
		done:           make(chan struct{}),
		pingInterval:   pi,
		pingTimeoutMax: ptm,
	}
}

// Send sends a string message to the WebSocket connection
func (c *WebsocketClient) Send(msg string) error {
	c.mu.Lock()
	conn := c.conn
	c.mu.Unlock()
	if conn == nil {
		return nil // Connection already closed
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := conn.Write(ctx, websocket.MessageText, []byte(msg))

	if err != nil {
		slog.Error("Failed to send message", "socket_id", c.socketId, "error", err)
	}
	return err
}

// SendJson marshals an object to JSON and sends it to the WebSocket connection
func (c *WebsocketClient) SendJson(obj any) error {
	c.mu.Lock()
	conn := c.conn
	c.mu.Unlock()
	if conn == nil {
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

// WebsocketClientSender defines the interface for sending messages and identifying the client.
type WebsocketClientSender interface {
	Send(msg string) error
	SendJson(obj any) error
	GetSocketId() string
	GetUserId() string
	GetUsername() string
}

// handleText routes text messages to the internal handler with callback.
// Pong messages are handled internally and never forwarded to the callback.
func (c *WebsocketClient) handleText(msg string, fn func(c WebsocketClientSender, msg string)) {
	if msg == "pong" {
		c.pingMu.Lock()
		c.pingTimeout = time.Time{}
		c.pingMu.Unlock()
		slog.Debug("Received pong", "socket_id", c.socketId)
		return
	}

	go func(sender WebsocketClientSender, message string, callback func(c WebsocketClientSender, msg string)) {
		// Text message handling logic here
		// Route to callback or process internally
		callback(sender, message)
	}(c, msg, fn)
}

// handleBinary routes binary messages to the internal handler with callback
func (c *WebsocketClient) handleBinary(data []byte, fn func(c WebsocketClientSender, msg string)) {
	go func(sender WebsocketClientSender, binaryData []byte, callback func(c WebsocketClientSender, msg string)) {
		// Binary message handling logic here
		// Can be logged, ignored, or processed internally
		slog.Debug("Received binary message", "socket_id", c.socketId, "length", len(binaryData))
		// Call callback for consistency with text messages
		callback(sender, string(binaryData))
	}(c, data, fn)
}

// ReceiveRoutine starts a goroutine that reads messages from the WebSocket connection
// and calls the provided function for each received message.
// The routine stops automatically when the connection closes
func (c *WebsocketClient) ReceiveRoutine(fn func(c WebsocketClientSender, msg string)) {
	go func() {
		defer close(c.receiveDone)

		c.mu.Lock()
		conn := c.conn
		c.mu.Unlock()

		if conn == nil {
			return
		}

		for {
			msgType, data, err := conn.Read(context.Background())
			if err != nil {
				slog.Error("WebSocket read error", "socket_id", c.socketId, "error", err)
				return
			}
			switch msgType {
			case websocket.MessageText:
				c.handleText(string(data), fn)
			case websocket.MessageBinary:
				c.handleBinary(data, fn)
			default:
				slog.Debug("Unknown message type", "socket_id", c.socketId, "type", msgType)
			}
		}
	}()
}

// PingRoutine starts a goroutine that sends periodic pings and disconnects the client
// if a pong is not received within pingTimeoutMax after a ping was sent.
func (c *WebsocketClient) PingRoutine() {
	go func() {
		ticker := time.NewTicker(c.pingInterval)
		defer ticker.Stop()

		for {
			select {
			case <-c.done:
				return
			case <-ticker.C:
				c.pingMu.Lock()
				timeout := c.pingTimeout
				c.pingMu.Unlock()

				if !timeout.IsZero() && time.Now().After(timeout) {
					slog.Warn("Ping timeout", "socket_id", c.socketId)
					c.Disconnect("ping timeout")
					return
				}

				if err := c.Send("ping"); err != nil {
					slog.Error("Failed to send ping", "socket_id", c.socketId, "error", err)
					c.Disconnect("ping send failed")
					return
				}

				c.pingMu.Lock()
				c.pingTimeout = time.Now().Add(c.pingTimeoutMax)
				c.pingMu.Unlock()
				slog.Debug("Sent ping", "socket_id", c.socketId)
			}
		}
	}()
}

// Disconnect closes the WebSocket connection with a reason (optional message)
// The reason is logged but never sent to clients before disconnection.
func (c *WebsocketClient) Disconnect(reason string) {
	c.mu.Lock()
	if c.disconnected {
		c.mu.Unlock()
		return // Connection already closed
	}
	c.disconnected = true
	close(c.done)
	conn := c.conn
	c.conn = nil
	c.mu.Unlock()

	if conn != nil {
		if err := conn.CloseNow(); err != nil {
			slog.Error("Failed to close websocket", "socket_id", c.socketId, "error", err)
		}
	}
	slog.Info("Disconnecting WebSocket", "socket_id", c.socketId, "reason", reason)
}

// GetSocketId returns the socket ID for this client
func (c *WebsocketClient) GetSocketId() string {
	return c.socketId
}

// GetUserId returns the user ID for this client
func (c *WebsocketClient) GetUserId() string {
	return c.userId
}

// GetUsername returns the username for this client
func (c *WebsocketClient) GetUsername() string {
	return c.username
}
