import { injectable } from "inversify";
import { NatsPublisher } from "./nats.conn";
import { MATCH_MAKER_SEARCHING_GAME } from "./pubsub.types";

export interface IMatchMakerPub {
	addUserToSearchGame(game: string, user_id: string): Promise<void>;
}

@injectable()
export class MatchMakerPub extends NatsPublisher implements IMatchMakerPub {
	constructor() {
		super();
	}

	async addUserToSearchGame(game: string, user_id: string): Promise<void> {
		await this.publish(
			MATCH_MAKER_SEARCHING_GAME,
			JSON.stringify({ game, user_id }),
		);
	}
}
