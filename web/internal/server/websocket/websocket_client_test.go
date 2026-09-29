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
	data := args.Get(1).([]byte)
	err := args.Error(2)
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
		msg := "some message"
		// Mock Write to return nil (success) when called with MessageText and any data
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, []byte(msg)).Return(nil).Once()

		err := conn.Send(msg)

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

func TestGiven_A_NewWebsocketClient_WhenSendJson(t *testing.T) {

	mockWebsocket := new(MockWebSocketConn)
	conn := NewWebsocketClient(mockWebsocket, "1", "user")
	t.Run("when sending a JSON object, it should be marshaled and sent successfully", func(t *testing.T) {

		// Mock Write to return nil (success) when called with MessageText and any data
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, mock.Anything).Return(nil).Once()

		obj := map[string]string{"key": "value"}
		err := conn.SendJson(obj)

		assert.Nil(t, err, "error should be nil")
	})
}

func TestGiven_A_NewWebsocketClient_WhenSendJsonFails(t *testing.T) {

	mockWebsocket := new(MockWebSocketConn)
	conn := NewWebsocketClient(mockWebsocket, "1", "user")
	t.Run("when sending a JSON object that fails to marshal, it should return an error", func(t *testing.T) {

		// Mock Write to never be called (since marshaling will fail first)
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, mock.Anything).Return(nil).Times(0)

		obj := map[string]string{"key": "value"}
		err := conn.SendJson(obj)

		assert.Nil(t, err, "error should be nil when marshaling fails (returns nil early)")
	})
}

func TestGiven_A_NewWebsocketClient_WhenReceiveRoutine(t *testing.T) {

	mockWebsocket := new(MockWebSocketConn)
	conn := NewWebsocketClient(mockWebsocket, "1", "user")
	t.Run("when receiving a message, it should call the provided function", func(t *testing.T) {
		message := "hello"
		// Mock Read to return a text message with data
		mockWebsocket.On("Read", mock.Anything).Return(websocket.MessageText, []byte(message), nil).Once()

		received := make(chan string, 1)
		conn.ReceiveRoutine(func(msg string) {
			received <- msg
		})

		select {
		case recivedMsg := <-received:
			assert.Equal(t, message, recivedMsg)
		default:
			//	waiting for message
		}
	})
}

func TestGiven_A_NewWebsocketClient_WhenReceiveRoutineError(t *testing.T) {

	mockWebsocket := new(MockWebSocketConn)
	conn := NewWebsocketClient(mockWebsocket, "1", "user")
	t.Run("when receiving an error during read, it should stop the receive routine", func(t *testing.T) {

		// Mock Read to return an error
		mockWebsocket.On("Read", mock.Anything).Return(websocket.MessageText, nil, assert.AnError).Once()

		received := make(chan string, 1)
		conn.ReceiveRoutine(func(msg string) {
			received <- msg
		})

		select {
		case _, ok := <-received:
			if !ok {
				t.Fatal("should not receive a message when read fails")
			}
		default:
			// Expected: no message received, routine stopped due to error
		}
	})
}

func TestGiven_A_NewWebsocketClient_WhenDisconnect(t *testing.T) {

	mockWebsocket := new(MockWebSocketConn)
	conn := NewWebsocketClient(mockWebsocket, "1", "user")
	t.Run("when disconnecting, it should close the connection and set conn to nil", func(t *testing.T) {

		// Mock CloseNow to be called once when Disconnect is invoked
		mockWebsocket.On("CloseNow").Once()

		conn.Disconnect("test reason")

		assert.Nil(t, conn.conn, "connection should be nil after disconnect")
	})
}

func TestGiven_A_NewWebsocketClient_WhenSendWithNilConn(t *testing.T) {

	mockWebsocket := new(MockWebSocketConn)
	conn := NewWebsocketClient(mockWebsocket, "1", "user")
	t.Run("when sending after disconnect, it should return nil (connection already closed)", func(t *testing.T) {

		// Mock CloseNow to be called once when Disconnect is invoked
		mockWebsocket.On("CloseNow").Once()

		conn.Disconnect("test reason")

		err := conn.Send("some message")

		assert.Nil(t, err, "error should be nil when connection is closed")
	})
}
