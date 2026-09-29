package ws_server

import (
	"context"
	"testing"

	"github.com/coder/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockWebSocketConn is a mock implementation of WebSocketConn for testing.
type MockWebSocketConn struct {
	mock.Mock
}

// Write mocks the Write method. It records the call and returns the first argument as error.
func (m *MockWebSocketConn) Write(ctx context.Context, msgType websocket.MessageType, data []byte) error {
	args := m.Called(ctx, msgType, data)
	return args.Error(0)
}

// Read mocks the Read method. It returns default values for testing.
func (m *MockWebSocketConn) Read(ctx context.Context) (websocket.MessageType, []byte, error) {
	args := m.Called(ctx)
	msgType := websocket.MessageText
	data := args.Get(0).([]byte)
	err := args.Error(1)
	return msgType, data, err
}

// CloseNow mocks the CloseNow method. It records the call but returns no value.
func (m *MockWebSocketConn) CloseNow() {
	m.Called()
}

func TestGiven_A_NewWebsocketClient(t *testing.T) {

	mockWebsocket := new(MockWebSocketConn)
	conn := NewWebsocketClient(mockWebsocket, "1", "user")
	t.Run("when sending a message, it should succeed", func(t *testing.T) {

		// Mock Write to return nil (success) when called with MessageText and any data
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, []byte("some message")).Return(nil).Once()

		err := conn.Send("some message")

		assert.Nil(t, err, "error should be nil")
	})

}

func TestGiven_A_NewWebsocketClient_WhenDisconnected(t *testing.T) {

	mockWebsocket := new(MockWebSocketConn)
	conn := NewWebsocketClient(mockWebsocket, "1", "user")
	t.Run("when sending a message while disconnected, it should succeed", func(t *testing.T) {

		// Mock CloseNow to be called once when Disconnect is invoked
		mockWebsocket.On("CloseNow").Once()
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, []byte("some message")).Return(assert.AnError).Panic("This function")
		conn.Disconnect("test reason")

		err := conn.Send("some message")

		assert.Nil(t, err, "error should be nil when connection is closed")
	})

}

func TestGiven_A_NewWebsocketClient_WhenError(t *testing.T) {

	mockWebsocket := new(MockWebSocketConn)
	conn := NewWebsocketClient(mockWebsocket, "1", "user")
	t.Run("when sending a message and an error is detected, it should return the error", func(t *testing.T) {

		// Mock Write to return an error when called once
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, []byte("some message")).Return(assert.AnError).Times(0)

		err := conn.Send("some message")

		assert.NotNil(t, err, "error should not be nil when write fails")
	})
}
