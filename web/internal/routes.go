package internal

import (
	"fmt"
	"io"
	"log"
	"slices"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// --------------------------

var users = []*fakeUserData{}
var matchmaking = []*matchmakingData{}

var sseDatas = []*sseData{}

//--------------------------

type signInBody struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	//Password string `json:"password"`
}

func signinRoute(c *gin.Context) {

	var requestBody signInBody
	if err := c.BindJSON(&requestBody); err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid payload",
		})
		return
	}

	// TODO: Business
	var data *fakeUserData
	pos := slices.IndexFunc(users, func(c *fakeUserData) bool { return c.email == requestBody.Email })
	if pos >= 0 {
		data = users[pos]
		data.createAt = time.Now().UTC().String()
		data.token = "update token" + data.createAt

	} else {
		t := time.Now().UTC().String()
		id, _ := uuid.NewUUID()
		data = &fakeUserData{
			id:       id.String(),
			email:    requestBody.Email,
			username: requestBody.Username,
			// password: requestBody.Password,
			token:    "token-fake" + t, // TODO: create a real token
			createAt: t,
			points:   0,
			matches:  []matchHistory{},
		}
		users = append(users, data)
	}

	c.JSON(200, gin.H{
		"token": data.token,
	})
}

func dashboardRoute(c *gin.Context) {

	u, ok := c.Get(WEB_CONTEXT_USER_DATA)
	if !ok {
		c.JSON(401, gin.H{
			"error": "Dashboard - Unauthorized",
		})
		return
	}
	user, ok := u.(*fakeUserData)
	if !ok {
		// TODO: should return an 50X
		return
	}

	c.JSON(200, gin.H{
		"username": user.username,
		"points":   user.points,
		"matches":  user.matches,
	})
}

type matchmakingBody struct {
	game string `json:"game"`
}

// method: POST, validate user and search for a match. this endpoint return a 202.
// after the match have the required amount of players is gooing to notify by SSE
func searchMatchRoute(c *gin.Context) {
	// TODO: missing middleware
	u, ok := c.Get(WEB_CONTEXT_USER_DATA)
	if !ok {
		c.JSON(401, gin.H{
			"error": "Dashboard - Unauthorized",
		})
		return
	}
	player, ok := u.(*fakeUserData)
	if !ok {
		// TODO: should return an 50X
		return
	}

	var matchmakingBody matchmakingBody
	if err := c.BindJSON(&matchmakingBody); err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid payload",
		})
		return
	}

	pos := slices.IndexFunc(matchmaking, func(m *matchmakingData) bool {
		return m.game == matchmakingBody.game && m.status == MATCHMAKING_STATUS_WAITING && len(m.playersId) < int(m.requiredPlayers)
	})

	now := time.Now()
	if pos == -1 {
		match := &matchmakingData{
			game:            matchmakingBody.game,
			createdAt:       now.Unix(),
			updatedAt:       now.Unix(),
			status:          MATCHMAKING_STATUS_WAITING,
			requiredPlayers: 2,
			playersId:       []string{player.id},
		}
		log.Printf("matchmaking Pos %d, and match: %v", pos, match)
		matchmaking = append(matchmaking, match)
	} else {
		match := matchmaking[pos]
		log.Printf("matchmaking Pos %d, and match: %v", pos, matchmaking[pos])
		// TODO: check that playerId not exist in the list
		match.playersId = append(match.playersId, player.id)
		match.updatedAt = now.Unix()

		if len(match.playersId) == int(match.requiredPlayers) {
			// TODO: create Websocket tokens
			// TODO: save into new array gameServerData
			// TODO: notify all users by SSE
			log.Printf("Found a match wiht players %v", match.playersId)
			match.status = MATCHMAKING_STATUS_IN_PROGRESS

			//!ERROR: sseDatas dosnt have the last user yet. WTF
			for _, v := range match.playersId {
				log.Printf("\n		- MATCH - Searching playerId:%s; sseDataLen:%d;\n", v, len(sseDatas))
				pos := slices.IndexFunc(sseDatas, func(s *sseData) bool { return s.user_id == v })
				if pos > -1 {
					sseDatas[pos].message <- fmt.Sprintf("game:%s;total_players:%d;", match.game, match.requiredPlayers)
				} else {
					log.Printf("ERROR: Something is not correct. the sseDatas dosn't have the user to notify it.")
				}
			}

		}
		log.Printf("After - matchmaking Pos %d, and match: %v", pos, matchmaking[pos])
	}

	// TODO: return temporary token should be the best action to do
	c.JSON(202, gin.H{
		"status": "waiting for other players",
	})
}

type MessageBody struct {
	Message  string `json:"message"`
	Username string `json:"username"`
}

// Listen and send server-side event
func sendNotificationsRoute(c *gin.Context) {
	v, ok := c.Get(WEB_CONTEXT_SSE_DATA)
	if !ok {
		return
	}
	data, ok := v.(*sseData)
	if !ok {
		return
	}
	log.Printf("\n	-	WEB_CONTEXT_SSE_DATA => user_id: %s, destroy: %b", data.user_id, data.destroy)

	c.Stream(func(w io.Writer) bool {
		// Stream message to client from message channel
		if msg, ok := <-data.message; ok {
			c.SSEvent("message", msg)
			return true
		}
		return false
	})
}
