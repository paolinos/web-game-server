package db

import (
	"testing"

	"paolinos/web-game-server/web/internal/models"

	"github.com/stretchr/testify/assert"
)

func setupDbTest(t *testing.T) *dbContext {
	if err := InitDb(":memory:"); err != nil {
		t.Fatalf("failed to init db: %v", err)
	}
	ctx := GetDbContext()
	t.Cleanup(func() {
		_ = ctx.DB.Close()
	})
	return ctx
}

func TestUserRepository(t *testing.T) {
	t.Run("Given a new user, when Add is called, then the user can be retrieved by email and token", func(t *testing.T) {
		ctx := setupDbTest(t)

		user, err := ctx.UserRepo.Add("user-1", "test@example.com", "test-user", "token-1")
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, "test-user", user.Username)

		byEmail, err := ctx.UserRepo.GetByEmail("test@example.com")
		assert.NoError(t, err)
		assert.NotNil(t, byEmail)
		assert.Equal(t, "user-1", byEmail.Id)

		byToken, err := ctx.UserRepo.GetByToken("token-1")
		assert.NoError(t, err)
		assert.NotNil(t, byToken)
		assert.Equal(t, "test@example.com", byToken.Email)
	})

	t.Run("Given a missing email, when GetByEmail is called, then it returns nil", func(t *testing.T) {
		ctx := setupDbTest(t)

		user, err := ctx.UserRepo.GetByEmail("missing@example.com")
		assert.NoError(t, err)
		assert.Nil(t, user)
	})

	t.Run("Given multiple users, when GetAllByIds is called, then it returns matching users", func(t *testing.T) {
		ctx := setupDbTest(t)

		_, err := ctx.UserRepo.Add("user-1", "a@example.com", "user-a", "token-a")
		assert.NoError(t, err)
		_, err = ctx.UserRepo.Add("user-2", "b@example.com", "user-b", "token-b")
		assert.NoError(t, err)
		_, err = ctx.UserRepo.Add("user-3", "c@example.com", "user-c", "token-c")
		assert.NoError(t, err)

		users, err := ctx.UserRepo.GetAllByIds([]string{"user-1", "user-3"})
		assert.NoError(t, err)
		assert.Len(t, users, 2)
	})
}

func TestMatchmakingRepository(t *testing.T) {
	t.Run("Given no matches, when GetByGameAndWaiting is called, then it returns nil", func(t *testing.T) {
		ctx := setupDbTest(t)

		match, err := ctx.MatchmakingRepo.GetByGameAndWaiting("TIC-TAC-TOE")
		assert.NoError(t, err)
		assert.Nil(t, match)
	})

	t.Run("Given a waiting match, when a second player joins, then the lobby becomes full", func(t *testing.T) {
		ctx := setupDbTest(t)

		_, err := ctx.UserRepo.Add("user-1", "u1@example.com", "user1", "token-1")
		assert.NoError(t, err)
		_, err = ctx.UserRepo.Add("user-2", "u2@example.com", "user2", "token-2")
		assert.NoError(t, err)

		match, err := ctx.MatchmakingRepo.Add("TIC-TAC-TOE", []string{"user-1"})
		assert.NoError(t, err)
		assert.NotNil(t, match)
		assert.Equal(t, models.MATCHMAKING_STATUS_WAITING, match.Status)

		err = ctx.MatchmakingRepo.UpdatePlayers(match, "user-2")
		assert.NoError(t, err)
		assert.Len(t, match.PlayersId, 2)

		err = ctx.MatchmakingRepo.UpdateStatus(match, models.MATCHMAKING_STATUS_IN_PROGRESS)
		assert.NoError(t, err)
		assert.Equal(t, models.MATCHMAKING_STATUS_IN_PROGRESS, match.Status)

		waiting, err := ctx.MatchmakingRepo.GetByGameAndWaiting("TIC-TAC-TOE")
		assert.NoError(t, err)
		assert.Nil(t, waiting)
	})
}
