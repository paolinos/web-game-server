import { inject, injectable } from "inversify";
import { NatsSubscriber } from "./nats.conn";
import { IOC_TYPES } from "../../ioc.types";
import { MATCH_MAKER_SEARCHING_ALL } from "./pubsub.types";
import { IMatchMakerBusiness } from "../../core/business/match-maker.business";

export interface IMatchMakerSub {
	startListening(): Promise<void>;
}

@injectable()
export class MatchMakerSub extends NatsSubscriber implements IMatchMakerSub {
	constructor(
		@inject(IOC_TYPES.MatchMakerBusiness)
		private readonly matchMakerBusiness: IMatchMakerBusiness,
	) {
		super();
	}

	async startListening(): Promise<void> {
		this.subscribe(
			MATCH_MAKER_SEARCHING_ALL,
			async (_event: string, payload: string) => {
				await this.addUserToSearchMatch(payload);
			},
		);
	}

	private async addUserToSearchMatch(payload: string): Promise<void> {
		const { game, user_id } = JSON.parse(payload);

		await this.matchMakerBusiness.userSearchingForMatch(game, user_id);
	}
}
