package ws_server

import (
	"log/slog"
	"sync"
)

// WebSocketManager is a singleton manager that tracks all clients and groups, providing centralized operations.
type WebSocketManager struct {
	clients map[string]*WebsocketClient // key: socketId
	groups  map[string][]string         // key: group_name, value: []socketId
	mu      sync.RWMutex
}

var manager *WebSocketManager

// GetWebsocketManager returns the singleton instance of WebSocketManager.
// If not initialized, it creates a new one and returns it.
func GetWebsocketManager() *WebSocketManager {
	manager.mu.Lock()
	defer manager.mu.Unlock()
	if manager == nil {
		manager = &WebSocketManager{
			clients: make(map[string]*WebsocketClient),
			groups:  make(map[string][]string),
		}
	}
	return manager
}

// Add adds a new WebSocket client to the manager.
// Generates UUID v4 for socketId, creates WebsocketClient instance, stores in clients map.
func (m *WebSocketManager) Add(conn WebSocketConn, userId string, username string) *WebsocketClient {
	m.mu.Lock()
	defer m.mu.Unlock()

	client := NewWebsocketClient(conn, userId, username)
	m.clients[client.socketId] = client
	slog.Info("client added", "socketId", client.socketId, "userId", userId, "username", username)
	return client
}

// Remove removes a client by socketId from the manager.
// Removes from clients map and all groups, stops receive routine goroutine if running.
func (m *WebSocketManager) Remove(socketId string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	client, exists := m.clients[socketId]
	if !exists {
		slog.Debug("no client found for user", "socketId", socketId)
		return
	}

	delete(m.clients, client.socketId)

	// TODO: we should review this
	// Remove user from all groups
	for group_name, users := range m.groups {
		new_users := make([]string, 0, len(users))
		for _, u := range users {
			if u != socketId {
				new_users = append(new_users, u)
			}
		}
		if len(new_users) == 0 {
			delete(m.groups, group_name)
		} else {
			m.groups[group_name] = new_users
		}
	}

	slog.Info("client removed", "socketId", client.socketId, "socketId", socketId)
}

// GetByUser searches through clients to find the client with matching socketId.
func (m *WebSocketManager) GetByUser(userId string) *WebsocketClient {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, client := range m.clients {
		if client.userId == userId {
			return client
		}
	}

	return nil
}

// GetBySocket performs a direct lookup in the clients map by socketId.
func (m *WebSocketManager) GetBySocket(socketId string) *WebsocketClient {
	m.mu.RLock()
	defer m.mu.RUnlock()

	return m.clients[socketId]
}

// SendBroadcast sends a message to all connected clients.
// Logs errors silently using slog.
func (m *WebSocketManager) SendBroadcast(msg string) {
	m.mu.RLock()
	clients := make([]*WebsocketClient, 0, len(m.clients))
	for _, client := range m.clients {
		clients = append(clients, client)
	}
	m.mu.RUnlock()

	for _, client := range clients {
		if client.conn != nil {
			err := client.Send(msg)
			if err != nil {
				slog.Debug("failed to broadcast message", "error", err)
			}
		}
	}
}

// Join adds a client to the specified groups.
// Creates group if it doesn't exist, adds socketId to group's user list (avoiding duplicates).
func (m *WebSocketManager) Join(c *WebsocketClient, groups ...string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	socketId := c.socketId

	for _, group := range groups {
		if _, exists := m.groups[group]; !exists {
			m.groups[group] = make([]string, 0)
		}

		// Avoid duplicates
		found := false
		for _, u := range m.groups[group] {
			if u == socketId {
				found = true
				break
			}
		}
		if !found {
			m.groups[group] = append(m.groups[group], socketId)
		}
	}

	slog.Info("client joined groups", "socketId", c.socketId, "groups", groups)
}

// SendGroup sends a message to all users in the specified group.
// If group doesn't exist or users disconnected, does nothing. Logs silently using slog.
func (m *WebSocketManager) SendGroup(group string, msg string) {
	m.mu.RLock()
	users := m.groups[group]
	m.mu.RUnlock()

	if len(users) == 0 {
		return
	}

	for _, socketId := range users {
		client := m.GetBySocket(socketId)
		if client != nil {
			err := client.Send(msg)
			if err != nil {
				slog.Debug("failed to send group message", "group", group, "socketId", socketId, "error", err)
			}
		}
	}
}

// Leave removes a client from the specified groups.
// Does nothing if client is not in the group.
func (m *WebSocketManager) Leave(c *WebsocketClient, groups ...string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	socketId := c.socketId

	for _, group := range groups {
		users, exists := m.groups[group]
		if !exists {
			continue
		}

		new_users := make([]string, 0, len(users))
		for _, u := range users {
			if u != socketId {
				new_users = append(new_users, u)
			}
		}
		if len(new_users) == 0 {
			delete(m.groups, group)
		} else {
			m.groups[group] = new_users
		}
	}

	slog.Info("client left groups", "socketId", c.socketId, "groups", groups)
}

// IsUserOnline checks if a user has an active client in the map.
func (m *WebSocketManager) IsUserOnline(socketId string) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()

	client := m.GetBySocket(socketId)
	return client != nil
}
