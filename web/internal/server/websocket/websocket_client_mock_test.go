package ws_server

import (
	"context"

	"github.com/coder/websocket"
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

// Read mocks the Read method. It returns mocked values for testing.
func (m *MockWebSocketConn) Read(ctx context.Context) (websocket.MessageType, []byte, error) {
	args := m.Called(ctx)
	msgType := args.Get(0).(websocket.MessageType)
	data := args.Get(1).([]byte)
	err := args.Error(2)
	return msgType, data, err
}

// CloseNow mocks the CloseNow method. It records the call but returns no value.
func (m *MockWebSocketConn) CloseNow() error {
	args := m.Called()
	return args.Error(0)
}

func createWebsocketAndMock(userId string) (*MockWebSocketConn, *WebsocketClient) {
	return createWebsocketAndMockWithConfig(userId, WebsocketClientConfig{})
}

func createWebsocketAndMockWithConfig(userId string, config WebsocketClientConfig) (*MockWebSocketConn, *WebsocketClient) {
	mockWebsocket := new(MockWebSocketConn)
	conn := NewWebsocketClientWithConfig(mockWebsocket, userId, userId+"_username", config)
	return mockWebsocket, conn
}
