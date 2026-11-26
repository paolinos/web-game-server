package db

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"paolinos/web-game-server/web/internal/models"
)

type SseListeningRepository struct {
	db *sql.DB
}

func (s *SseListeningRepository) GetByUserId(userId string) (*models.SseListening, error) {
	row := s.db.QueryRow(`SELECT user_id, updated_at FROM USER_SESSION WHERE user_id = ?`, userId)

	var listening models.SseListening
	err := row.Scan(&listening.UserId, &listening.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &listening, nil
}

func (s *SseListeningRepository) Add(userId string) (*models.SseListening, error) {
	data := models.SseListening{
		UserId:    userId,
		UpdatedAt: time.Now().Unix(),
	}

	id, err := uuid.NewUUID()
	if err != nil {
		return nil, err
	}

	_, err = s.db.Exec(
		`INSERT INTO USER_SESSION (id, user_id, token, expire_at) VALUES (?, ?, ?, ?)`,
		id.String(), userId, id.String(), 0,
	)
	if err != nil {
		return nil, err
	}

	return &data, nil
}

func (s *SseListeningRepository) Delete(userId string) error {
	_, err := s.db.Exec(`DELETE FROM USER_SESSION WHERE user_id = ?`, userId)
	return err
}
