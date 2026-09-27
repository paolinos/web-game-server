package server

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"time"

	dbpk "paolinos/web-game-server/web/internal/db"
	"paolinos/web-game-server/web/internal/helpers"
	httpherlper "paolinos/web-game-server/web/internal/http_helper"
	"paolinos/web-game-server/web/internal/lang"
	"paolinos/web-game-server/web/internal/middleware"
	"paolinos/web-game-server/web/internal/models"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

// --------------------------

//--------------------------

type signInBody struct {
	Email    string `json:"email"`
	Username string `json:"username"`
}

func signinRoute(c *echo.Context) error {

	var requestBody signInBody
	if err := c.Bind(&requestBody); err != nil {

		return httpherlper.ErrorJsonResponse(c, http.StatusBadRequest, lang.ERROR_INVALID_PAYLOAD)
	}

	db := dbpk.GetDbContext()
	data := db.UserRepo.GetByEmail(requestBody.Email)
	if data != nil {
		data.CreateAt = time.Now().UTC().String()
		data.Token = "update token" + data.CreateAt

	} else {

		id, _ := uuid.NewUUID()
		tk := "tk"
		tmp := db.UserRepo.Add(id.String(), requestBody.Email, requestBody.Username, helpers.GenerateRandomHex(25, &tk))
		data = &tmp
	}

	return c.JSON(http.StatusOK, map[string]string{
		"token": data.Token,
	})
}

func dashboardRoute(c *echo.Context) error {

	u := c.Get(models.WEB_CONTEXT_USER_DATA)
	if u == nil {
		slog.Debug("Dashboard (/dashboard): user_data not found, Invalid user. Unauthorized.")
		return httpherlper.ErrorJsonResponse(c, http.StatusUnauthorized, lang.ERROR_UNAUTHORIZED)
	}
	user, ok := u.(*models.FakeUserData)
	if !ok {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "unexpected"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"username": user.Username,
		"points":   user.Points,
		"matches":  user.Matches,
	})
}

type matchmakingBody struct {
	Game string `json:"game"`
}

// method: POST, validate user and search for a match. this endpoint return a 202.
// after the match have the required amount of players is gooing to notify by SSE
func searchMatchRoute(c *echo.Context) error {
	u := c.Get(models.WEB_CONTEXT_USER_DATA)
	if u == nil {
		slog.Debug("Dashboard (search-match): user_data not found, Invalid user. Unauthorized.")
		return httpherlper.ErrorJsonResponse(c, http.StatusUnauthorized, lang.ERROR_UNAUTHORIZED)
	}
	player, ok := u.(*models.FakeUserData)
	if !ok {
		slog.Error("Dashboard (search-match): Unexpected error casting user_data as fakeUserData.")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "unexpected"})
	}

	var matchmakingBody matchmakingBody
	if err := c.Bind(&matchmakingBody); err != nil {
		slog.Debug("Dashboard (search-match): Invalid payload")
		return httpherlper.ErrorJsonResponse(c, http.StatusBadRequest, lang.ERROR_INVALID_PAYLOAD)
	}

	db := dbpk.GetDbContext()
	p := db.SseListeningRepo.GetByUserId(player.Id)
	if p == nil {
		slog.Debug("SearchMatchRoute: Player is not listening for SSE")
		return httpherlper.ErrorJsonResponse(c, http.StatusBadRequest, lang.VALIDATION_USER_NOT_LISTENING_SSE)
	}

	match := db.MatchmakingRepo.GetByGameAndWaiting(matchmakingBody.Game)

	if match == nil {
		tmp := db.MatchmakingRepo.Add(matchmakingBody.Game, []string{player.Id})
		match = &tmp
	} else {
		db.MatchmakingRepo.UpdatePlayers(match, player.Id)

		if len(match.PlayersId) == int(match.RequiredPlayers) {
			db.MatchmakingRepo.UpdateStatus(match, models.MATCHMAKING_STATUS_IN_PROGRESS)

			for _, v := range match.PlayersId {
				ssePlayer := db.SseListeningRepo.GetByUserId(v)
				sseCache := middleware.SseCacheData.GetBy(v)
				if ssePlayer != nil && sseCache != nil {

					tmp := map[string]any{"game": match.Game, "total_players": match.RequiredPlayers, "players": match.PlayersId}
					msg, _ := json.Marshal(tmp)

					sseCache.Message <- string(msg)
				} else {
					slog.Error("ERROR: Something is not correct. the sseDatas dosn't have the user to notify it.")
				}
			}

		}
	}

	return c.JSON(http.StatusAccepted, map[string]string{
		"status": "waiting for other players",
	})
}

type MessageBody struct {
	Message  string `json:"message"`
	Username string `json:"username"`
}

// Listen and send server-side event
func sendNotificationsRoute(c *echo.Context) error {
	v := c.Get(models.WEB_CONTEXT_SSE_DATA)
	if v == nil {
		slog.Error("Impossible to get WEB_CONTEXT_SSE_DATA")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal"})
	}
	data, ok := v.(*middleware.SseData)
	if !ok {
		slog.Error("Error trying to parse the SseData object from context")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal"})
	}

	c.Response().WriteHeader(http.StatusOK)
	w := c.Response()
	for msg := range data.Message {
		w.Write([]byte("event: message\n"))
		w.Write([]byte("data: " + msg))
		w.Write([]byte("\n\n"))
		middleware.SseCacheData.Delete(data.UserId)
	}

	return nil
}

func indextRoute(c *echo.Context) error {
	// TODO: we should return the "public/index.html"
	filePath := getWorkingDirectory() + "/public/index.html"
	data, err := os.ReadFile(filePath)
	if err != nil {
		slog.Error("Error trying to load index.html", "path", filePath, "error", err)
		return c.JSON(http.StatusNotFound, map[string]string{"error": "index.html not found"})
	}

	c.Response().Header().Set("Content-Type", "text/html; charset=utf-8")
	return c.String(http.StatusOK, string(data))
}
