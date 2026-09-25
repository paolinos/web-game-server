package db

import (
	"paolinos/web-game-server/web/internal/models"
	"time"
)

type MatchmakingRepository struct {
	Repository[models.MatchmakingData]
}

// Get by Game, status in Waiting and count of required players
func (m *MatchmakingRepository) GetByGameAndWaiting(game string) *models.MatchmakingData {
	return m.getBy(func(m models.MatchmakingData) bool {
		return m.Game == game && m.Status == models.MATCHMAKING_STATUS_WAITING && len(m.PlayersId) < int(m.RequiredPlayers)
	})
}

func (m *MatchmakingRepository) Add(game string, players []string) models.MatchmakingData {
	now := time.Now()
	match := models.MatchmakingData{
		Game:            game,
		CreatedAt:       now.Unix(),
		UpdatedAt:       now.Unix(),
		Status:          models.MATCHMAKING_STATUS_WAITING,
		RequiredPlayers: 2,
		PlayersId:       players,
	}
	m.add(match)
	return match
}

func (m *MatchmakingRepository) UpdatePlayers(match *models.MatchmakingData, playerId string) {
	match.PlayersId = append(match.PlayersId, playerId)
	match.UpdatedAt = time.Now().Unix()
}

func (m *MatchmakingRepository) UpdateStatus(match *models.MatchmakingData, status string) {
	match.Status = status
}
