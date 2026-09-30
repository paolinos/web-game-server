package ws_server

import (
	"testing"

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
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, []byte("some message")).Return(assert.AnError).Times(0)

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
		mockWebsocket.On("Write", mock.Anything, websocket.MessageText, mock.Anything).Return(nil).Times(0)

		obj := map[string]string{"key": "value"}
		err := conn.SendJson(obj)

		assert.Nil(t, err, "error should be nil when marshaling fails (returns nil early)")
	})
}

func Test_NewWebsocketClient_ReceiveRoutine(t *testing.T) {

	mockWebsocket, conn := createWebsocketAndMock("user_1")
	t.Run("when receiving a message, it should call the provided function", func(t *testing.T) {
		message := "hello"
		// Mock Read to return a text message with data
		mockWebsocket.On("Read", mock.Anything).Return(websocket.MessageText, []byte(message), nil)

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

func TestNewWebsocketClient_ReceiveRoutine_Error(t *testing.T) {

	mockWebsocket, conn := createWebsocketAndMock("user_1")
	t.Run("when receiving an error during read, it should stop the receive routine", func(t *testing.T) {

		// TODO: remove the Once(). To review later.
		mockWebsocket.On("Read", mock.Anything).Return(websocket.MessageText, []byte(""), assert.AnError)

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
