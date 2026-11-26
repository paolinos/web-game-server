package ws_server

import (
	"encoding/json"
	"log/slog"

	"paolinos/web-game-server/web/internal/db"
	"paolinos/web-game-server/web/internal/models"
)

const (
	MessageTypeMatchSearch = "match.search"
	MessageTypeMatchFound  = "match"
)

type MatchSearchMessage struct {
	Type string `json:"type"`
	Game string `json:"game"`
}

type MatchFoundMessage struct {
	Type         string   `json:"type"`
	Game         string   `json:"game"`
	TotalPlayers uint8    `json:"total_players"`
	Players      []string `json:"players"`
}

// HandleMatchSearch processes a WebSocket match-search request and notifies players
// via WebSocket when the lobby is full.
func HandleMatchSearch(sender WebsocketClientSender, raw string) {
	var msg MatchSearchMessage
	if err := json.Unmarshal([]byte(raw), &msg); err != nil {
		slog.Warn("failed to parse match.search message", "socket_id", sender.GetSocketId(), "error", err)
		_ = sender.SendJson(map[string]any{
			"type":    "error",
			"message": "invalid match.search payload",
		})
		return
	}

	if msg.Game == "" {
		_ = sender.SendJson(map[string]any{
			"type":    "error",
			"message": "game is required",
		})
		return
	}

	dbCtx := db.GetDbContext()

	userId := sender.GetUserId()
	if userId == "" {
		_ = sender.SendJson(map[string]any{
			"type":    "error",
			"message": "user not authenticated",
		})
		return
	}

	match, err := dbCtx.MatchmakingRepo.GetByGameAndWaiting(msg.Game)
	if err != nil {
		slog.Error("failed to query matchmaking", "error", err)
		_ = sender.SendJson(map[string]any{
			"type":    "error",
			"message": "failed to search for match",
		})
		return
	}

	if match == nil {
		_, err := dbCtx.MatchmakingRepo.Add(msg.Game, []string{userId})
		if err != nil {
			slog.Error("failed to create match lobby", "error", err)
			_ = sender.SendJson(map[string]any{
				"type":    "error",
				"message": "failed to create match lobby",
			})
			return
		}
		_ = sender.SendJson(map[string]any{
			"type":    "match.search.waiting",
			"game":    msg.Game,
			"message": "waiting for other players",
		})
		return
	}

	// Add player to existing lobby if not already present.
	alreadyInLobby := false
	for _, id := range match.PlayersId {
		if id == userId {
			alreadyInLobby = true
			break
		}
	}
	if !alreadyInLobby {
		if err := dbCtx.MatchmakingRepo.UpdatePlayers(match, userId); err != nil {
			slog.Error("failed to join match lobby", "error", err)
			_ = sender.SendJson(map[string]any{
				"type":    "error",
				"message": "failed to join match lobby",
			})
			return
		}
	}

	if len(match.PlayersId) == int(match.RequiredPlayers) {
		if err := dbCtx.MatchmakingRepo.UpdateStatus(match, models.MATCHMAKING_STATUS_IN_PROGRESS); err != nil {
			slog.Error("failed to update match status", "error", err)
			_ = sender.SendJson(map[string]any{
				"type":    "error",
				"message": "failed to start match",
			})
			return
		}

		notification := MatchFoundMessage{
			Type:         MessageTypeMatchFound,
			Game:         match.Game,
			TotalPlayers: match.RequiredPlayers,
			Players:      match.PlayersId,
		}

		manager := GetWebsocketManager()
		for _, playerId := range match.PlayersId {
			client := manager.GetByUser(playerId)
			if client != nil {
				if err := client.SendJson(notification); err != nil {
					slog.Debug("failed to notify player about match", "player_id", playerId, "error", err)
				}
			}
		}
		return
	}

	_ = sender.SendJson(map[string]any{
		"type":    "match.search.waiting",
		"game":    msg.Game,
		"message": "waiting for other players",
	})
}
