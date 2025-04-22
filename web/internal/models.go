package internal

const WEB_CONTEXT_USER_DATA string = "user_data"
const WEB_CONTEXT_SSE_DATA string = "sse_data"
const WEB_CONTEXT_REQUEST_DATA string = "request_data"

const MATCHMAKING_STATUS_WAITING string = "match-waiting-players"
const MATCHMAKING_STATUS_IN_PROGRESS string = "match-in-progress"
const MATCHMAKING_STATUS_END string = "match-end"

type requestData struct {
	id        string
	timestamp string
}

type sseData struct {
	user_id string
	message chan string
	destroy bool
}

type matchHistory struct {
	game     string
	points   uint32
	playedAt uint32
}
type fakeUserData struct {
	id       string
	email    string
	username string
	// password string
	token    string
	createAt string
	points   uint32
	matches  []matchHistory
}

type matchmakingData struct {
	game            string
	createdAt       int64
	updatedAt       int64
	requiredPlayers uint8
	playersId       []string
	status          string
}

type playerGameToken struct {
	userId           string
	username         string
	connectionStatus string // to-connect, connecting, connected, error
	updatedAt        int64
	points           uint32
}

type gameServerData struct {
	id      string
	players []*playerGameToken
}
