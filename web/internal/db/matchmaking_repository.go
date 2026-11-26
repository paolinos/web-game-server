package db

import (
	"database/sql"
	"log/slog"
	"time"

	"github.com/google/uuid"
	"paolinos/web-game-server/web/internal/models"
)

type MatchmakingRepository struct {
	db *sql.DB
}

func (m *MatchmakingRepository) GetByGameAndWaiting(game string) (*models.MatchmakingData, error) {
	row := m.db.QueryRow(`
		SELECT id, game, status, required_players, created_at, updated_at
		FROM MATCH
		WHERE game = ?
		  AND status = ?
		  AND (SELECT COUNT(*) FROM USER_MATCH WHERE match_id = MATCH.id) < required_players
		ORDER BY created_at ASC
		LIMIT 1
	`, game, models.MATCHMAKING_STATUS_WAITING)

	return m.scanMatch(row)
}

func (m *MatchmakingRepository) scanMatch(row *sql.Row) (*models.MatchmakingData, error) {
	var match models.MatchmakingData
	err := row.Scan(&match.Id, &match.Game, &match.Status, &match.RequiredPlayers, &match.CreatedAt, &match.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	players, err := m.GetPlayers(match.Id)
	if err != nil {
		slog.Error("failed to load match players", "match_id", match.Id, "error", err)
		return nil, err
	}
	match.PlayersId = players
	return &match, nil
}

func (m *MatchmakingRepository) Add(game string, players []string) (*models.MatchmakingData, error) {
	now := time.Now()
	match := models.MatchmakingData{
		Game:            game,
		CreatedAt:       now.Unix(),
		UpdatedAt:       now.Unix(),
		Status:          models.MATCHMAKING_STATUS_WAITING,
		RequiredPlayers: 2,
		PlayersId:       players,
	}

	id, err := uuid.NewUUID()
	if err != nil {
		return nil, err
	}
	match.Id = id.String()

	tx, err := m.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(
		`INSERT INTO MATCH (id, game, status, required_players, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
		match.Id, match.Game, match.Status, match.RequiredPlayers, match.CreatedAt, match.UpdatedAt,
	); err != nil {
		return nil, err
	}

	for _, playerId := range players {
		if err := m.addPlayerToMatchTx(tx, match.Id, playerId, now.Unix()); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &match, nil
}

func (m *MatchmakingRepository) UpdatePlayers(match *models.MatchmakingData, playerId string) error {
	now := time.Now().Unix()

	if err := m.addPlayerToMatchTx(nil, match.Id, playerId, now); err != nil {
		return err
	}

	match.PlayersId = append(match.PlayersId, playerId)
	match.UpdatedAt = now
	return nil
}

func (m *MatchmakingRepository) addPlayerToMatchTx(tx *sql.Tx, matchId string, playerId string, joinedAt int64) error {
	id, err := uuid.NewUUID()
	if err != nil {
		return err
	}

	if tx != nil {
		_, err = tx.Exec(
			`INSERT INTO USER_MATCH (id, match_id, user_id, joined_at) VALUES (?, ?, ?, ?)`,
			id.String(), matchId, playerId, joinedAt,
		)
	} else {
		_, err = m.db.Exec(
			`INSERT INTO USER_MATCH (id, match_id, user_id, joined_at) VALUES (?, ?, ?, ?)`,
			id.String(), matchId, playerId, joinedAt,
		)
	}
	return err
}

func (m *MatchmakingRepository) UpdateStatus(match *models.MatchmakingData, status string) error {
	now := time.Now().Unix()
	_, err := m.db.Exec(
		`UPDATE MATCH SET status = ?, updated_at = ? WHERE id = ?`,
		status, now, match.Id,
	)
	if err != nil {
		return err
	}
	match.Status = status
	match.UpdatedAt = now
	return nil
}

func (m *MatchmakingRepository) GetPlayers(matchId string) ([]string, error) {
	rows, err := m.db.Query(`SELECT user_id FROM USER_MATCH WHERE match_id = ? ORDER BY joined_at ASC`, matchId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var players []string
	for rows.Next() {
		var playerId string
		if err := rows.Scan(&playerId); err != nil {
			return nil, err
		}
		players = append(players, playerId)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return players, nil
}

func (m *MatchmakingRepository) GetMatchById(matchId string) (*models.MatchmakingData, error) {
	row := m.db.QueryRow(`
		SELECT id, game, status, required_players, created_at, updated_at
		FROM MATCH
		WHERE id = ?
	`, matchId)

	return m.scanMatch(row)
}
