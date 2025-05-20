package db

import (
	"paolinos/web-game-server/web/internal/models"
	"time"
)

type SseListeningRepository struct {
	Repository[models.SseListening]
}

func (s *SseListeningRepository) GetByUserId(userId string) *models.SseListening {

	return s.getBy(func(c models.SseListening) bool {
		return c.UserId == userId
	})
}

func (s *SseListeningRepository) Add(userId string) models.SseListening {

	data := models.SseListening{
		UserId:    userId,
		UpdatedAt: time.Now().Unix(),
	}

	s.add(data)

	return data
}

func (s *SseListeningRepository) Delete(userId string) {
	s.delete(func(sl models.SseListening) bool { return sl.UserId == userId })
}
