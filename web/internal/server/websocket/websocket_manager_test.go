package ws_server

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// createManager creates a new WebSocketManager instance for testing.
func createManager() *WebSocketManager {
	return &WebSocketManager{
		clients: make(map[string]*WebsocketClient),
		groups:  make(map[string][]string),
	}
}

// TestWebSocketManager_Add tests the Add method of WebSocketManager.
func TestWebSocketManager_Add(t *testing.T) {
	t.Run("when adding a client with nil connection, it should be stored in clients map", func(t *testing.T) {
		manager := createManager()

		client := manager.Add(nil, "test-socket-id", "test-user")

		assert.NotNil(t, client)
		assert.Equal(t, "test-user", client.username)
		assert.Contains(t, manager.clients, client.socketId)
	})

	t.Run("when adding multiple clients with nil connections, all should be stored", func(t *testing.T) {
		manager := createManager()

		client1 := manager.Add(nil, "client-1", "user1")
		client2 := manager.Add(nil, "client-2", "user2")
		client3 := manager.Add(nil, "client-3", "user3")

		assert.NotNil(t, client1)
		assert.NotNil(t, client2)
		assert.NotNil(t, client3)
		assert.Equal(t, 3, len(manager.clients))
	})

	t.Run("when adding multiple clients with same username, each should be stored separately", func(t *testing.T) {
		manager := createManager()

		client1 := manager.Add(nil, "socket-1", "user")
		client2 := manager.Add(nil, "socket-2", "user")

		assert.NotNil(t, client1)
		assert.NotNil(t, client2)
		assert.Equal(t, 2, len(manager.clients))
	})
}

// TestWebSocketManager_Remove tests the Remove method of WebSocketManager.
func TestWebSocketManager_Remove(t *testing.T) {
	t.Run("when removing a client by socketId, it should be removed from clients map", func(t *testing.T) {
		manager := createManager()

		client := manager.Add(nil, "test-socket-id", "test-user")

		assert.Equal(t, 1, len(manager.clients))

		manager.Remove(client.socketId)

		assert.Equal(t, 0, len(manager.clients))
	})

	t.Run("when removing a non-existent client, it should do nothing", func(t *testing.T) {
		manager := createManager()

		_ = manager.Add(nil, "test-socket-id", "test-user")

		assert.Equal(t, 1, len(manager.clients))

		manager.Remove("non-existent-socket-id")

		assert.Equal(t, 1, len(manager.clients))
	})

	t.Run("when removing removes client from all groups", func(t *testing.T) {
		manager := createManager()

		client := manager.Add(nil, "test-socket-id", "test-user")
		manager.Join(client, "group1", "group2")

		assert.Equal(t, 1, len(manager.groups["group1"]))
		assert.Equal(t, 1, len(manager.groups["group2"]))

		manager.Remove(client.socketId)

		assert.Equal(t, 0, len(manager.groups["group1"]))
		assert.Equal(t, 0, len(manager.groups["group2"]))
	})

}
