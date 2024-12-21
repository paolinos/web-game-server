import "reflect-metadata";
import { Container } from "inversify";
import { IOC_TYPES } from "./ioc.types";
import { IDBContext, LocalContext } from "./infrastructure/db/db.context";
import {
	IUserRepository,
	UserRepository,
} from "./infrastructure/db/user.repository";
import {
	IMatchMakerRepository,
	MatchMakerRepository,
} from "./infrastructure/db/match-maker.repository";
import { AuthBusiness, IAuthBusiness } from "./core/business/auth.business";
import { IUserBusiness, UserBusiness } from "./core/business/user.business";
//import { INatsConn, NatsConn } from "./infrastructure/pubsub/nats.conn";
import {
	IMatchMakerPub,
	MatchMakerPub,
} from "./infrastructure/pubsub/match-maker.pub";
import {
	IMatchMakerSub,
	MatchMakerSub,
} from "./infrastructure/pubsub/match-maker.sub";
import {
	GameServerPub,
	IGameServerPub,
} from "./infrastructure/pubsub/game-server.pub";
import {
	GameServerSub,
	IGameServerSub,
} from "./infrastructure/pubsub/game-server.sub";
import {
	IMatchMakerBusiness,
	MatchMakerBusiness,
} from "./core/business/match-maker.business";
import {
	GameServerRepository,
	IGameServerRepository,
} from "./infrastructure/db/game-server.repository";

const iocContainer = new Container();
iocContainer
	.bind<IDBContext>(IOC_TYPES.DBContext)
	.to(LocalContext)
	.inSingletonScope();

// PubSubs
iocContainer
	.bind<IMatchMakerSub>(IOC_TYPES.MatchMakerSub)
	.to(MatchMakerSub)
	.inSingletonScope();
iocContainer
	.bind<IMatchMakerPub>(IOC_TYPES.MatchMakerPub)
	.to(MatchMakerPub)
	.inSingletonScope();
iocContainer
	.bind<IGameServerSub>(IOC_TYPES.GameServerSub)
	.to(GameServerSub)
	.inSingletonScope();
iocContainer
	.bind<IGameServerPub>(IOC_TYPES.GameServerPub)
	.to(GameServerPub)
	.inSingletonScope();
// Repos
iocContainer.bind<IUserRepository>(IOC_TYPES.UserRepository).to(UserRepository);
iocContainer
	.bind<IMatchMakerRepository>(IOC_TYPES.MatchMakerRepository)
	.to(MatchMakerRepository);
iocContainer
	.bind<IGameServerRepository>(IOC_TYPES.GameServerRepository)
	.to(GameServerRepository);

// Business
iocContainer.bind<IAuthBusiness>(IOC_TYPES.AuthBusiness).to(AuthBusiness);
iocContainer.bind<IUserBusiness>(IOC_TYPES.UserBusiness).to(UserBusiness);
iocContainer
	.bind<IMatchMakerBusiness>(IOC_TYPES.MatchMakerBusiness)
	.to(MatchMakerBusiness);

export default iocContainer;
