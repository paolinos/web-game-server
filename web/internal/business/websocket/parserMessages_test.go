package websocket

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseMessage(t *testing.T) {
	t.Run("Given a valid JSON message with type notification, When parse the message, Then should return the parsed map", func(t *testing.T) {
		data := []byte(`{"type":"notification","message":"hello"}`)

		result, err := ParseMessage(data)

		assert.NoError(t, err)
		assert.Equal(t, "notification", result["type"])
		assert.Equal(t, "hello", result["message"])
	})

	t.Run("Given a valid JSON message without type, When parse the message, Then should return the parsed map", func(t *testing.T) {
		data := []byte(`{"message":"hello"}`)

		result, err := ParseMessage(data)

		assert.NoError(t, err)
		assert.Nil(t, result["type"])
		assert.Equal(t, "hello", result["message"])
	})

	t.Run("Given an invalid JSON message, When parse the message, Then should return an error", func(t *testing.T) {
		data := []byte(`{invalid json}`)

		result, err := ParseMessage(data)

		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestMessageBase(t *testing.T) {
	t.Run("Given a MessageBase struct, When marshaled to JSON, Then should contain type field", func(t *testing.T) {
		msg := MessageBase{Type: "notification"}

		data, err := json.Marshal(msg)

		assert.NoError(t, err)
		assert.Contains(t, string(data), `"type":"notification"`)
	})
}
