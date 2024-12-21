export const IOC_TYPES = {
	// Base
	DBContext: "infrastructure-db-context",
	NatsConn: "infrastructure-nats-conn",
	// Repos
	UserRepository: "infrastructure-user-repo",
	MatchMakerRepository: "infrastructure-match-maker-repo",
	GameServerRepository: "infrastructure-game-server-repo",
	// PubSubs
	MatchMakerPub: "infrastructure-match-maker-pub",
	MatchMakerSub: "infrastructure-match-maker-sub",
	GameServerPub: "infrastructure-game-server-pub",
	GameServerSub: "infrastructure-game-server-sub",
	// Business
	AuthBusiness: "core-auth-business",
	UserBusiness: "core-user-business",
	MatchMakerBusiness: "core-match-maker-business",
};
