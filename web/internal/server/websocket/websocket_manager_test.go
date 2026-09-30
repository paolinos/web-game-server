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

		userId := "user_id_1"
		username := "test-user"
		client := manager.Add(nil, userId, username)

		assert.NotNil(t, client)
		assert.Equal(t, username, client.username)
		assert.Equal(t, userId, client.userId)
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

		client1 := manager.Add(nil, "user_id_1", "user_1")
		client2 := manager.Add(nil, "user_id_2", "user_2")

		assert.NotNil(t, client1)
		assert.NotNil(t, client2)
		assert.Equal(t, 2, len(manager.clients))
	})
}

// TestWebSocketManager_Remove tests the Remove method of WebSocketManager.
func TestWebSocketManager_Remove(t *testing.T) {
	t.Run("when removing a client by socketId, it should be removed from clients map", func(t *testing.T) {
		manager := createManager()

		client := manager.Add(nil, "user_id_1", "test-user")

		assert.Equal(t, 1, len(manager.clients))

		manager.Remove(client.socketId)

		assert.Equal(t, 0, len(manager.clients))
	})

	t.Run("when removing a non-existent client, it should do nothing", func(t *testing.T) {
		manager := createManager()

		_ = manager.Add(nil, "user_id_1", "test-user")

		assert.Equal(t, 1, len(manager.clients))

		manager.Remove("non-existent-socket-id")

		assert.Equal(t, 1, len(manager.clients))
	})

	t.Run("when removing removes client from all groups", func(t *testing.T) {
		manager := createManager()

		client := manager.Add(nil, "user_id_1", "test-user")
		manager.Join(client, "group1", "group2")

		assert.Equal(t, 1, len(manager.groups["group1"]))
		assert.Equal(t, 1, len(manager.groups["group2"]))

		manager.Remove(client.socketId)

		assert.Equal(t, 0, len(manager.groups["group1"]))
		assert.Equal(t, 0, len(manager.groups["group2"]))
	})

}

// TestWebSocketManager_GetBySocket tests the GetBySocket method of WebSocketManager.
func TestWebSocketManager_GetBySocket(t *testing.T) {
	t.Run("when getting a client by socketId, it should return the correct client", func(t *testing.T) {
		manager := createManager()

		client1 := manager.Add(nil, "user_id_1", "user1")
		manager.Add(nil, "user_id_2", "user2")

		got := manager.GetBySocket(client1.socketId)

		assert.NotNil(t, got)
		assert.Equal(t, client1.socketId, got.socketId)
		assert.Equal(t, client1.username, got.username)
	})

	t.Run("when getting a non-existent client by socketId, it should return nil", func(t *testing.T) {
		manager := createManager()

		got := manager.GetBySocket("non-existent")

		assert.Nil(t, got)
	})

	t.Run("when getting a client from multiple clients with same socketId, it should return the correct one", func(t *testing.T) {
		manager := createManager()

		client1 := manager.Add(nil, "user_id_1", "user1")
		manager.Add(nil, "user_id_2", "user2") // Same socketId as client1

		got := manager.GetBySocket(client1.socketId)

		assert.NotNil(t, got)
		assert.Equal(t, client1.userId, got.userId)
		assert.Equal(t, client1.username, got.username)
		assert.Equal(t, 2, len(manager.clients))
	})
}

// TestWebSocketManager_GetByUser tests the GetByUser method of WebSocketManager.
func TestWebSocketManager_GetByUser(t *testing.T) {
	t.Run("when getting a client by username, it should return the correct client", func(t *testing.T) {
		manager := createManager()

		client := manager.Add(nil, "user_id_1", "user1")
		manager.Add(nil, "user_id_2", "user2")

		got := manager.GetByUser(client.userId)

		assert.NotNil(t, got)
		assert.Equal(t, client.socketId, got.socketId)
		assert.Equal(t, client.username, got.username)
	})

	t.Run("when getting a non-existent client by username, it should return nil", func(t *testing.T) {
		manager := createManager()

		got := manager.GetByUser("non-existent")

		assert.Nil(t, got)
	})

	t.Run("when getting a client from multiple clients with same username, it should return the first one", func(t *testing.T) {
		manager := createManager()

		userId := "user_id_1"
		client := manager.Add(nil, userId, "user_1")
		manager.Add(nil, "user_id_2", "user_2")

		got := manager.GetByUser(client.userId)

		assert.NotNil(t, got)
		assert.Equal(t, client.socketId, got.socketId)
		assert.Equal(t, client.username, got.username)
		assert.Equal(t, 2, len(manager.clients))
	})

	t.Run("when getting a user from multiple groups, it should return the first one", func(t *testing.T) {
		manager := createManager()

		client1 := manager.Add(nil, "user_id_1", "user_1")
		client2 := manager.Add(nil, "user_id_2", "user_2") // Same username as client1

		manager.Join(client1, "group1", "group2")
		manager.Join(client2, "group3")

		got := manager.GetByUser(client1.userId)

		assert.NotNil(t, got)
		assert.Equal(t, client1.socketId, got.socketId)
		assert.Equal(t, client1.username, got.username)
		assert.Equal(t, 1, len(manager.groups["group1"]))
		assert.Equal(t, 1, len(manager.groups["group2"]))
		assert.Equal(t, manager.groups["group1"][0], client1.socketId)
		assert.Equal(t, manager.groups["group2"][0], client1.socketId)
		assert.Equal(t, 1, len(manager.groups["group3"]))
	})

}
