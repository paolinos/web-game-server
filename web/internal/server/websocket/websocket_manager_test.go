package ws_server

import (
	"testing"

	"github.com/coder/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
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

// TestWebSocketManager_Join tests the Join method of WebSocketManager.
func TestWebSocketManager_Join(t *testing.T) {
	t.Run("when joining a client to a group, it should be added to groups map", func(t *testing.T) {
		manager := createManager()

		client := manager.Add(nil, "user_id_1", "test-user")

		manager.Join(client, "group1")

		assert.Contains(t, manager.groups["group1"], client.socketId)
		assert.Equal(t, 1, len(manager.groups["group1"]))
	})

	t.Run("when joining a client to multiple groups, it should be added to all", func(t *testing.T) {
		manager := createManager()

		client := manager.Add(nil, "user_id_1", "test-user")

		manager.Join(client, "group1", "group2", "group3")

		assert.Contains(t, manager.groups["group1"], client.socketId)
		assert.Contains(t, manager.groups["group2"], client.socketId)
		assert.Contains(t, manager.groups["group3"], client.socketId)
		assert.Equal(t, 3, len(manager.groups))
	})

	t.Run("when joining the same client to the same group again, it should not duplicate", func(t *testing.T) {
		manager := createManager()

		client := manager.Add(nil, "user_id_1", "test-user")

		manager.Join(client, "group1")
		manager.Join(client, "group1")

		assert.Equal(t, 1, len(manager.groups["group1"]))
		assert.Contains(t, manager.groups["group1"], client.socketId)
	})
}

// TestWebSocketManager_SendBroadcast tests the SendBroadcast method of WebSocketManager.
func TestWebSocketManager_SendBroadcast(t *testing.T) {
	t.Run("when sending a broadcast to no clients, it should not panic", func(t *testing.T) {
		manager := createManager()

		// This should not panic and should handle empty client list gracefully
		manager.SendBroadcast("broadcast message")
	})
}

// TestWebSocketManager_SendGroup tests the SendGroup method of WebSocketManager.
func TestWebSocketManager_SendGroup(t *testing.T) {
	t.Run("when sending to a non-existent group, it should not panic", func(t *testing.T) {
		manager := createManager()

		// This should not panic and should handle empty/non-existent groups gracefully
		manager.SendGroup("non-existent-group", "group message")
	})

	t.Run("when sending to a group with multiple clients and all succeed", func(t *testing.T) {
		manager := createManager()
		message := "group message"

		mockWebsocket1 := new(MockWebSocketConn)
		mockWebsocket2 := new(MockWebSocketConn)
		mockWebsocket3 := new(MockWebSocketConn)
		mockWebsocket4 := new(MockWebSocketConn)

		// Create mock clients for 4 clients in the same group
		client1 := manager.Add(mockWebsocket1, "user_id_1", "user1")
		client2 := manager.Add(mockWebsocket2, "user_id_2", "user2")
		client3 := manager.Add(mockWebsocket3, "user_id_3", "user3")
		client4 := manager.Add(mockWebsocket4, "user_id_4", "user4")

		mockWebsocket1.On("Write", mock.Anything, websocket.MessageText, []byte(message)).Return(nil).Once()
		mockWebsocket2.On("Write", mock.Anything, websocket.MessageText, []byte(message)).Return(nil).Once()
		mockWebsocket3.On("Write", mock.Anything, websocket.MessageText, []byte(message)).Return(nil).Once()
		mockWebsocket4.On("Write", mock.Anything, websocket.MessageText, []byte(message)).Return(nil).Once()

		manager.Join(client1, "group1")
		manager.Join(client2, "group1")
		manager.Join(client3, "group1")
		manager.Join(client4, "group1")

		// Verify all 4 clients are in group1
		assert.Equal(t, 4, len(manager.groups["group1"]))
		assert.Contains(t, manager.groups["group1"], client1.socketId)
		assert.Contains(t, manager.groups["group1"], client2.socketId)
		assert.Contains(t, manager.groups["group1"], client3.socketId)
		assert.Contains(t, manager.groups["group1"], client4.socketId)

		// Send to group1
		manager.SendGroup("group1", message)

		// Verify group1 still has all clients
		assert.Equal(t, 4, len(manager.groups["group1"]))
	})
}
