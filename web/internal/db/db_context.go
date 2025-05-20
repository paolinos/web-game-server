package db

type dbContext struct {
	UserRepo         UserRepository
	MatchmakingRepo  MatchmakingRepository
	SseListeningRepo SseListeningRepository
}

var context *dbContext

// Get DB Context
func GetDbContext() *dbContext {
	if context == nil {
		context = &dbContext{
			UserRepo:         UserRepository{},
			MatchmakingRepo:  MatchmakingRepository{},
			SseListeningRepo: SseListeningRepository{},
		}
	}

	return context
}
