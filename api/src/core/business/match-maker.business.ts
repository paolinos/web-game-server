import { inject, injectable } from "inversify";
import { IOC_TYPES } from "../../ioc.types";
import { IUserRepository } from "../../infrastructure/db/user.repository";
import { IMatchMakerPub } from "../../infrastructure/pubsub/match-maker.pub";
import { IMatchMakerRepository } from "../../infrastructure/db/match-maker.repository";
import { IGameServerRepository } from "../../infrastructure/db/game-server.repository";
import { LANG } from "../../lang";
import { IGameServerPub } from "../../infrastructure/pubsub/game-server.pub";

export interface IMatchMakerBusiness {
	searchGame(email: string, game: string): Promise<Error | undefined>;

	userSearchingForMatch(game: string, user_id: string): Promise<void>;
}

@injectable()
export class MatchMakerBusiness implements IMatchMakerBusiness {
	constructor(
		@inject(IOC_TYPES.UserRepository)
		private readonly userRepo: IUserRepository,
		@inject(IOC_TYPES.MatchMakerRepository)
		private readonly matchMakerRepo: IMatchMakerRepository,
		@inject(IOC_TYPES.GameServerRepository)
		private readonly gameServerRepo: IGameServerRepository,
		@inject(IOC_TYPES.MatchMakerPub)
		private readonly matchMakerPub: IMatchMakerPub,
        @inject(IOC_TYPES.GameServerPub)
		private readonly gameServerPub: IGameServerPub,
        
	) {}

	async searchGame(email: string, game: string): Promise<Error | undefined> {
		const user = await this.userRepo.getByEmail(email);
		if (user) {
			const gameServer = await this.gameServerRepo.getByName(game);
			if (!gameServer) {
				return new Error(LANG.ERROR.GAME.NOT_FOUND);
			}

			await this.matchMakerPub.addUserToSearchGame(game, user.id);
			// TODO: Missing the timeout

			return;
		}
		return new Error(LANG.ERROR.USER.NOT_FOUND);
	}

	async userSearchingForMatch(game: string, user_id: string): Promise<void> {

        const [gameServer, userMatch] = await Promise.all([
            this.gameServerRepo.getByName(game),
            this.matchMakerRepo.getUser(user_id)
        ]);
        if (!gameServer){
            // TODO: We should notify by WS to the user that there's some error with the Game
            console.warn(`Game server with name:${game}, Does NOT exist. We should notify by WS to the client`);
            return;
        }

        // TODO: Could be nice to have a Circuit Breaker here.

		// if exist && same game => do nothing
		// if exist && ! game => remove and add
		// if not exist => add
		let needToUpdate = true;
		if (userMatch) {
			if (userMatch.gameName !== game) {
				await this.matchMakerRepo.removeUser(user_id);
			} else {
				needToUpdate = false;
			}
		}
		if (needToUpdate) {
			await this.matchMakerRepo.addUser(game, user_id);
		}

		// TODO: update the game settings after
		const usersIds = await this.matchMakerRepo.getUsersAvailableByGame(game);
		if (usersIds.length >= gameServer.requirements.players_required) {
			const matchPlayersId = usersIds.slice(0, gameServer.requirements.players_required);
			await this.matchMakerRepo.removeUser(...matchPlayersId);

			const matchInfo = {
				gameName: "tateti",
				players: matchPlayersId.map((q) => ({
					userId: q,
					token: "Auth Token here",
					email: "some email",
				})),
				createdAt: new Date(),
				time: Date.now(),
				gameServerId: "default",
			};

			await this.gameServerPub.createMatchToServer(
				matchInfo.gameServerId,
				matchInfo,
			);
		}
	}
}
