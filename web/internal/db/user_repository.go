package db

import (
	"paolinos/web-game-server/web/internal/models"
	"slices"
	"time"
)

type UserRepository struct {
	Repository[models.FakeUserData]
}

func (u *UserRepository) GetByEmail(email string) *models.FakeUserData {
	return u.getBy(func(c models.FakeUserData) bool {
		return c.Email == email
	})
}

func (u *UserRepository) GetByToken(token string) *models.FakeUserData {
	return u.getBy(func(c models.FakeUserData) bool {
		return c.Token == token
	})
}

func (u *UserRepository) GetAllByIds(ids []string) []models.FakeUserData {

	data := []models.FakeUserData{}
	// TODO: review filtering libs
	for _, v := range u.data {
		if slices.Contains(ids, v.Id) {
			data = append(data, v)
			if len(data) == len(ids) {
				break
			}
		}
	}

	return data
}

func (u *UserRepository) Add(id string, email string, username string, token string) models.FakeUserData {
	t := time.Now().UTC().String()
	m := models.FakeUserData{
		Id:       id,
		Email:    email,
		Username: username,
		Token:    token,
		CreateAt: t,
		Points:   0,
		Matches:  []models.MatchHistory{},
	}
	u.add(m)
	return m
}
