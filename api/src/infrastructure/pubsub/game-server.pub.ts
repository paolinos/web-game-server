import { injectable } from "inversify";
import { NatsPublisher } from "./nats.conn";
import { GAME_SERVER_ASSIGN_MATCH } from "./pubsub.types";

export interface IGameServerPub {
	createMatchToServer(serverId: string, data: any): Promise<void>;
}

@injectable()
export class GameServerPub extends NatsPublisher implements IGameServerPub {
	constructor() {
		super();
	}

	// TODO: To be defined
	async createMatchToServer(serverId: string, data: any): Promise<void> {
		await this.publish(
			`${GAME_SERVER_ASSIGN_MATCH}${serverId}`,
			JSON.stringify(data),
		);
	}
}
