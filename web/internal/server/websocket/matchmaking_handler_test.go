package ws_server

import (
	"encoding/json"
	"testing"

	"paolinos/web-game-server/web/internal/db"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func setupMatchmakingTest(t *testing.T) *db.MatchmakingRepository {
	ctx := db.GetDbContext()
	originalMatchmakingRepo := ctx.MatchmakingRepo

	ctx.MatchmakingRepo = db.MatchmakingRepository{}

	// Ensure the singleton's sync.Once has fired before we replace the manager,
	// otherwise GetWebsocketManager() called by the handler will overwrite it.
	_ = GetWebsocketManager()
	manager = createManager()

	t.Cleanup(func() {
		ctx.MatchmakingRepo = originalMatchmakingRepo
	})

	return &ctx.MatchmakingRepo
}

type mockSender struct {
	mock.Mock
	socketId string
	userId   string
	username string
}

func (m *mockSender) Send(msg string) error {
	args := m.Called(msg)
	return args.Error(0)
}

func (m *mockSender) SendJson(obj any) error {
	args := m.Called(obj)
	return args.Error(0)
}

func (m *mockSender) GetSocketId() string { return m.socketId }
func (m *mockSender) GetUserId() string    { return m.userId }
func (m *mockSender) GetUsername() string  { return m.username }

func assertMessageType(t *testing.T, obj any, expectedType string) {
	var data []byte
	switch v := obj.(type) {
	case []byte:
		data = v
	case string:
		data = []byte(v)
	default:
		marshaled, err := json.Marshal(obj)
		assert.NoError(t, err)
		data = marshaled
	}

	var payload map[string]any
	assert.NoError(t, json.Unmarshal(data, &payload))
	assert.Equal(t, expectedType, payload["type"])
}

func TestHandleMatchSearch(t *testing.T) {

	t.Run("Given an invalid JSON payload, when HandleMatchSearch is called, then it sends an error message", func(t *testing.T) {
		setupMatchmakingTest(t)

		sender := &mockSender{socketId: "socket-1", userId: "user-1", username: "user1"}
		sender.On("SendJson", mock.Anything).Return(nil).Once()

		HandleMatchSearch(sender, "{invalid json}")

		sender.AssertExpectations(t)
		assertMessageType(t, sender.Calls[0].Arguments[0], "error")
	})

	t.Run("Given a payload without a game, when HandleMatchSearch is called, then it sends an error message", func(t *testing.T) {
		setupMatchmakingTest(t)

		sender := &mockSender{socketId: "socket-1", userId: "user-1", username: "user1"}
		sender.On("SendJson", mock.Anything).Return(nil).Once()

		HandleMatchSearch(sender, `{"type":"match.search"}`)

		sender.AssertExpectations(t)
		assertMessageType(t, sender.Calls[0].Arguments[0], "error")
	})

	t.Run("Given no waiting match, when HandleMatchSearch is called, then it creates a lobby and sends a waiting message", func(t *testing.T) {
		repo := setupMatchmakingTest(t)

		sender := &mockSender{socketId: "socket-1", userId: "user-1", username: "user1"}
		sender.On("SendJson", mock.Anything).Return(nil).Once()

		HandleMatchSearch(sender, `{"type":"match.search","game":"TIC-TAC-TOE"}`)

		sender.AssertExpectations(t)
		assertMessageType(t, sender.Calls[0].Arguments[0], "match.search.waiting")

		match := repo.GetByGameAndWaiting("TIC-TAC-TOE")
		assert.NotNil(t, match)
		assert.Equal(t, []string{"user-1"}, match.PlayersId)
	})

	t.Run("Given a waiting match, when a second player searches, then it fills the lobby and notifies both players", func(t *testing.T) {
		repo := setupMatchmakingTest(t)

		// First player creates the lobby.
		repo.Add("TIC-TAC-TOE", []string{"user-1"})
		m := repo.GetByGameAndWaiting("TIC-TAC-TOE")
		assert.NotNil(t, m, "lobby should be waiting")

		// Mock clients for both players in the manager.
		mockConn1 := new(MockWebSocketConn)
		player1 := manager.Add(mockConn1, "user-1", "user1")
		mockConn1.On("Write", mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()

		mockConn2 := new(MockWebSocketConn)
		player2 := manager.Add(mockConn2, "user-2", "user2")
		mockConn2.On("Write", mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()

		// Second player triggers the match via the real client registered in the manager.
		HandleMatchSearch(player2, `{"type":"match.search","game":"TIC-TAC-TOE"}`)

		mockConn1.AssertExpectations(t)
		mockConn2.AssertExpectations(t)

		if len(mockConn1.Calls) > 0 {
			assertMessageType(t, mockConn1.Calls[0].Arguments[2], "match")
		}
		if len(mockConn2.Calls) > 0 {
			assertMessageType(t, mockConn2.Calls[0].Arguments[2], "match")
		}

		match := repo.GetByGameAndWaiting("TIC-TAC-TOE")
		assert.Nil(t, match)

		manager.Remove(player1.socketId)
		manager.Remove(player2.socketId)
	})
}
