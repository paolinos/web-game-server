package models

const WEB_CONTEXT_USER_DATA string = "user_data"
const WEB_CONTEXT_SSE_DATA string = "sse_data"
const WEB_CONTEXT_REQUEST_DATA string = "request_data"

const MATCHMAKING_STATUS_WAITING string = "match-waiting-players"
const MATCHMAKING_STATUS_IN_PROGRESS string = "match-in-progress"
const MATCHMAKING_STATUS_END string = "match-end"

type RequestData struct {
	Id        string
	Timestamp string
}

type MatchHistory struct {
	Game     string
	Points   uint32
	PlayedAt uint32
}
type FakeUserData struct {
	Id       string
	Email    string
	Username string
	// password string
	Token    string
	CreateAt string
	Points   uint32
	Matches  []MatchHistory
}

type MatchmakingData struct {
	Game            string
	CreatedAt       int64
	UpdatedAt       int64
	RequiredPlayers uint8
	PlayersId       []string
	Status          string
}

type PlayerGameToken struct {
	UserId           string
	Username         string
	ConnectionStatus string // to-connect, connecting, connected, error
	UpdatedAt        int64
	Points           uint32
}

type GameServerData struct {
	Id      string
	Players []*PlayerGameToken
}
