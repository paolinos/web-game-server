package db

import (
	"database/sql"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"paolinos/web-game-server/web/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func (u *UserRepository) scanUser(row *sql.Row) (*models.FakeUserData, error) {
	var user models.FakeUserData
	err := row.Scan(&user.Id, &user.Email, &user.Username, &user.Token, &user.CreateAt, &user.Points)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (u *UserRepository) scanUsers(rows *sql.Rows) ([]models.FakeUserData, error) {
	defer rows.Close()
	var users []models.FakeUserData
	for rows.Next() {
		var user models.FakeUserData
		if err := rows.Scan(&user.Id, &user.Email, &user.Username, &user.Token, &user.CreateAt, &user.Points); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (u *UserRepository) GetByEmail(email string) (*models.FakeUserData, error) {
	row := u.db.QueryRow(`SELECT id, email, username, token, create_at, points FROM USER WHERE email = ?`, email)
	return u.scanUser(row)
}

func (u *UserRepository) GetByToken(token string) (*models.FakeUserData, error) {
	row := u.db.QueryRow(`SELECT id, email, username, token, create_at, points FROM USER WHERE token = ?`, token)
	return u.scanUser(row)
}

func (u *UserRepository) GetAllByIds(ids []string) ([]models.FakeUserData, error) {
	if len(ids) == 0 {
		return []models.FakeUserData{}, nil
	}

	placeholders := make([]string, len(ids))
	args := make([]any, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args[i] = id
	}

	query := fmt.Sprintf(
		`SELECT id, email, username, token, create_at, points FROM USER WHERE id IN (%s)`,
		strings.Join(placeholders, ","),
	)
	rows, err := u.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	return u.scanUsers(rows)
}

func (u *UserRepository) Add(id string, email string, username string, token string) (*models.FakeUserData, error) {
	createAt := time.Now().UTC().String()
	points := uint32(0)

	_, err := u.db.Exec(
		`INSERT INTO USER (id, email, username, token, create_at, points) VALUES (?, ?, ?, ?, ?, ?)`,
		id, email, username, token, createAt, points,
	)
	if err != nil {
		slog.Error("failed to insert user", "error", err)
		return nil, err
	}

	return &models.FakeUserData{
		Id:       id,
		Email:    email,
		Username: username,
		Token:    token,
		CreateAt: createAt,
		Points:   points,
		Matches:  []models.MatchHistory{},
	}, nil
}

func (u *UserRepository) UpdateToken(user *models.FakeUserData) error {
	_, err := u.db.Exec(`UPDATE USER SET token = ?, create_at = ? WHERE id = ?`, user.Token, user.CreateAt, user.Id)
	return err
}
