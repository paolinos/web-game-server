package ws_server

import (
	"encoding/json"
	"math"
	"testing"
	"time"

	"github.com/coder/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func Test_NewWebsocketClient_Send(t *testing.T) {

	mockWebsocket, conn := createWebsocketAndMock("user_1")

	t.Run("when sending a message, it should succeed", func(t *testing.T) {
		msg := "some message"
		// Mock Write to return nil (success) when called with MessageText and any data
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, []byte(msg)).Return(nil).Once()

		err := conn.Send(msg)

		assert.Nil(t, err, "error should be nil")
	})
}

func Test_NewWebsocketClient_Send_Disconnected(t *testing.T) {

	mockWebsocket, conn := createWebsocketAndMock("user_1")
	t.Run("when sending a message while disconnected, it should succeed", func(t *testing.T) {

		// Mock CloseNow to be called once when Disconnect is invoked
		mockWebsocket.On("CloseNow").Return(nil).Once()
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, []byte("some message")).Return(assert.AnError).Panic("This function")
		conn.Disconnect("test reason")

		err := conn.Send("some message")

		assert.Nil(t, err, "error should be nil when connection is closed")
	})

}

func Test_NewWebsocketClient_Send_Error(t *testing.T) {

	mockWebsocket, conn := createWebsocketAndMock("user_1")
	t.Run("when sending a message and an error is detected, it should return the error", func(t *testing.T) {

		// Mock Write to return an error when called once
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, []byte("some message")).Return(assert.AnError).Once()

		err := conn.Send("some message")

		assert.NotNil(t, err, "error should not be nil when write fails")
	})
}

func Test_NewWebsocketClient_SendJson(t *testing.T) {

	mockWebsocket, conn := createWebsocketAndMock("user_1")
	t.Run("when sending a JSON object, it should be marshaled and sent successfully", func(t *testing.T) {

		// Mock Write to return nil (success) when called with MessageText and any data
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, mock.Anything).Return(nil).Once()

		obj := map[string]string{"key": "value"}
		err := conn.SendJson(obj)

		assert.Nil(t, err, "error should be nil")
	})
}

func Test_NewWebsocketClient_SendJson_Error(t *testing.T) {

	mockWebsocket, conn := createWebsocketAndMock("user_1")
	t.Run("when sending a JSON object that fails to marshal, it should return an error", func(t *testing.T) {

		// Mock Write to never be called (since marshaling will fail first)
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, mock.Anything).Return(assert.AnError).Times(0)

		//obj := map[string]string{}
		err := conn.SendJson(math.NaN())

		var unsupportedValueErr *json.UnsupportedValueError
		assert.ErrorAs(t, err, &unsupportedValueErr)
	})
}

func Test_NewWebsocketClient_ReceiveRoutine(t *testing.T) {

	mockWebsocket, conn := createWebsocketAndMock("user_1")

	t.Run("when receiving a text message, it should call the provided function with WebsocketClientSender", func(t *testing.T) {
		message := "hello"
		// Mock Read to return a text message with data, then an error to stop the routine
		mockWebsocket.On("Read", mock.Anything).Return(websocket.MessageText, []byte(message), nil).Once()
		mockWebsocket.On("Read", mock.Anything).Return(websocket.MessageText, []byte(""), assert.AnError).Once()

		received := make(chan string, 1)
		conn.ReceiveRoutine(func(c WebsocketClientSender, msg string) {
			received <- msg
		})

		select {
		case recivedMsg := <-received:
			assert.Equal(t, message, recivedMsg)
		case <-time.After(500 * time.Millisecond):
			t.Fatal("expected to receive a message")
		}
	})

	t.Run("when receiving a binary message, it should call the provided function with WebsocketClientSender", func(t *testing.T) {
		binaryData := []byte{1, 2, 3, 4, 5}
		// Create a new mock for this subtest to avoid conflicts
		mockWebsocket2, conn2 := createWebsocketAndMock("user_2")
		// Mock Read to return a binary message with data, then an error to stop the routine
		mockWebsocket2.On("Read", mock.Anything).Return(websocket.MessageBinary, binaryData, nil).Once()
		mockWebsocket2.On("Read", mock.Anything).Return(websocket.MessageText, []byte(""), assert.AnError).Once()

		received := make(chan string, 1)
		conn2.ReceiveRoutine(func(c WebsocketClientSender, msg string) {
			// Binary messages are logged internally, but we still need to call the callback
			received <- string(binaryData)
		})

		select {
		case recivedMsg := <-received:
			assert.NotNil(t, recivedMsg, "should receive a message")
		case <-time.After(500 * time.Millisecond):
			t.Fatal("expected to receive a message")
		}
	})
}

func TestNewWebsocketClient_ReceiveRoutine_Error(t *testing.T) {

	mockWebsocket, conn := createWebsocketAndMock("user_1")
	t.Run("when receiving an error during read, it should stop the receive routine", func(t *testing.T) {

		received := make(chan string, 1)
		mockWebsocket.On("Read", mock.Anything).Return(websocket.MessageText, []byte(""), assert.AnError).Once()
		conn.ReceiveRoutine(func(c WebsocketClientSender, msg string) {
			received <- msg
		})

		select {
		case msg := <-received:
			t.Fatalf("unexpected message received: %q", msg)
		case <-time.After(500 * time.Millisecond):
			// Expected: no message received, routine stopped due to error
		}
	})
}

func Test_NewWebsocketClient_Disconnect(t *testing.T) {

	mockWebsocket, conn := createWebsocketAndMock("user_1")
	t.Run("when disconnecting, it should close the connection and set conn to nil", func(t *testing.T) {

		// Mock CloseNow to be called once when Disconnect is invoked
		mockWebsocket.On("CloseNow").Return(nil).Once()

		conn.Disconnect("test reason")

		assert.Nil(t, conn.conn, "connection should be nil after disconnect")
	})
}

func Test_NewWebsocketClient_Disconnect_Disconnected(t *testing.T) {

	mockWebsocket, conn := createWebsocketAndMock("user_1")
	t.Run("when sending after disconnect, it should return nil (connection already closed)", func(t *testing.T) {

		// Mock CloseNow to be called once when Disconnect is invoked
		mockWebsocket.On("CloseNow").Return(nil).Times(1)

		conn.Disconnect("force disconnection")

		conn.Disconnect("try disconnect")
	})
}

func Test_NewWebsocketClient_PongHandling(t *testing.T) {

	t.Run("when receiving a pong message, it should not call the provided callback", func(t *testing.T) {
		mockWebsocket, conn := createWebsocketAndMock("user_1")
		// Mock Read to return a pong message, then an error to stop the routine
		mockWebsocket.On("Read", mock.Anything).Return(websocket.MessageText, []byte("pong"), nil).Once()
		mockWebsocket.On("Read", mock.Anything).Return(websocket.MessageText, []byte(""), assert.AnError).Once()

		called := false
		conn.ReceiveRoutine(func(c WebsocketClientSender, msg string) {
			called = true
		})

		// Give the goroutine a moment to process
		time.Sleep(50 * time.Millisecond)

		assert.False(t, called, "callback should not be called for pong messages")
	})

	t.Run("when receiving a non-pong message, it should call the provided callback", func(t *testing.T) {
		mockWebsocket, conn := createWebsocketAndMock("user_1")
		message := "hello"
		// Mock Read to return a normal text message, then an error to stop the routine
		mockWebsocket.On("Read", mock.Anything).Return(websocket.MessageText, []byte(message), nil).Once()
		mockWebsocket.On("Read", mock.Anything).Return(websocket.MessageText, []byte(""), assert.AnError).Once()

		received := make(chan string, 1)
		conn.ReceiveRoutine(func(c WebsocketClientSender, msg string) {
			received <- msg
		})

		select {
		case receivedMsg := <-received:
			assert.Equal(t, message, receivedMsg)
		case <-time.After(500 * time.Millisecond):
			t.Fatal("expected to receive a message")
		}
	})
}
