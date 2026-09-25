package internal

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"time"

	dbpk "paolinos/web-game-server/web/internal/db"
	"paolinos/web-game-server/web/internal/helpers"
	httpherlper "paolinos/web-game-server/web/internal/http_helper"
	"paolinos/web-game-server/web/internal/lang"
	"paolinos/web-game-server/web/internal/middleware"
	"paolinos/web-game-server/web/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// --------------------------

//--------------------------

type signInBody struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	//Password string `json:"password"`
}

func signinRoute(c *gin.Context) {

	var requestBody signInBody
	if err := c.BindJSON(&requestBody); err != nil {

		httpherlper.ErrorJsonResponse(c, http.StatusBadRequest, lang.ERROR_INVALID_PAYLOAD)
		return
	}

	db := dbpk.GetDbContext()
	data := db.UserRepo.GetByEmail(requestBody.Email)
	if data != nil {
		data.CreateAt = time.Now().UTC().String()
		data.Token = "update token" + data.CreateAt

	} else {

		id, _ := uuid.NewUUID()
		// TODO: create a real token
		tk := "tk"
		tmp := db.UserRepo.Add(id.String(), requestBody.Email, requestBody.Username, helpers.GenerateRandomHex(25, &tk))
		data = &tmp
	}

	c.JSON(http.StatusOK, gin.H{
		"token": data.Token,
	})
}

func dashboardRoute(c *gin.Context) {

	u, ok := c.Get(models.WEB_CONTEXT_USER_DATA)
	if !ok {
		slog.Debug("Dashboard (/dashboard): user_data not found, Invalid user. Unauthorized.")
		httpherlper.ErrorJsonResponse(c, http.StatusUnauthorized, lang.ERROR_UNAUTHORIZED)
		return
	}
	user, ok := u.(*models.FakeUserData)
	if !ok {
		// TODO: should return an 50X
		return
	}

	c.JSON(http.StatusOK, gin.H{
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
func searchMatchRoute(c *gin.Context) {
	u, ok := c.Get(models.WEB_CONTEXT_USER_DATA)
	if !ok {
		slog.Debug("Dashboard (search-match): user_data not found, Invalid user. Unauthorized.")
		httpherlper.ErrorJsonResponse(c, http.StatusUnauthorized, lang.ERROR_UNAUTHORIZED)
		return
	}
	player, ok := u.(*models.FakeUserData)
	if !ok {
		slog.Error("Dashboard (search-match): Unexpected error casting user_data as fakeUserData.")
		httpherlper.ErrorJsonResponse(c, http.StatusInternalServerError, lang.ERROR_UNEXPECTED)
		return
	}

	var matchmakingBody matchmakingBody
	if err := c.BindJSON(&matchmakingBody); err != nil {
		slog.Debug("Dashboard (search-match): Invalid payload")
		httpherlper.ErrorJsonResponse(c, http.StatusBadRequest, lang.ERROR_INVALID_PAYLOAD)
		return
	}

	db := dbpk.GetDbContext()
	// *NOTE: Check if user already listening for SSE event.
	p := db.SseListeningRepo.GetByUserId(player.Id)
	if p == nil {
		slog.Debug("SearchMatchRoute: Player is not listening for SSE")
		httpherlper.ErrorJsonResponse(c, http.StatusBadRequest, lang.VALIDATION_USER_NOT_LISTENING_SSE)
		return
	}

	match := db.MatchmakingRepo.GetByGameAndWaiting(matchmakingBody.Game)

	if match == nil {
		tmp := db.MatchmakingRepo.Add(matchmakingBody.Game, []string{player.Id})
		match = &tmp
	} else {
		// TODO: We should change this code when we use a real DB. too many queries
		db.MatchmakingRepo.UpdatePlayers(match, player.Id)

		if len(match.PlayersId) == int(match.RequiredPlayers) {
			// TODO: check comment below
			db.MatchmakingRepo.UpdateStatus(match, models.MATCHMAKING_STATUS_IN_PROGRESS)

			// TODO: For this should need a chan
			for _, v := range match.PlayersId {
				ssePlayer := db.SseListeningRepo.GetByUserId(v)
				sseCache := middleware.SseCacheData.GetBy(v)
				if ssePlayer != nil && sseCache != nil {

					// TODO: we should include username & id
					tmp := map[string]any{"game": match.Game, "total_players": match.RequiredPlayers, "players": match.PlayersId}
					msg, _ := json.Marshal(tmp)

					sseCache.Message <- string(msg)
				} else {
					//! if user not connected or lost connection? We should set the mach again in MATCHMAKING_STATUS_WAITING and send an error to the user
					slog.Error("ERROR: Something is not correct. the sseDatas dosn't have the user to notify it.")
				}
			}

		}
	}

	// TODO: return temporary token should be the best action to do
	c.JSON(http.StatusAccepted, gin.H{
		"status": "waiting for other players",
	})
}

type MessageBody struct {
	Message  string `json:"message"`
	Username string `json:"username"`
}

// Listen and send server-side event
func sendNotificationsRoute(c *gin.Context) {
	v, ok := c.Get(models.WEB_CONTEXT_SSE_DATA)
	if !ok {
		slog.Error("Impossible to get WEB_CONTEXT_SSE_DATA")
		return
	}
	data, ok := v.(*middleware.SseData)
	if !ok {
		slog.Error("Error trying to parse the SseData object from context")
		return
	}

	c.Stream(func(w io.Writer) bool {
		// send SSE message to FE
		if msg, ok := <-data.Message; ok {
			c.SSEvent("message", msg)
			middleware.SseCacheData.Delete(data.UserId)
			return true
		}
		return false
	})
}
