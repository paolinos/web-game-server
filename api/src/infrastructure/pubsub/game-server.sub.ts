import { injectable } from "inversify";
import { NatsSubscriber } from "./nats.conn";
import { GAME_SERVER_INIT } from "./pubsub.types";

export interface IGameServerSub {
	startListening(): Promise<void>;
}

/**
 * GameServerSub is going to listen all the events of the GameServer Services
 */
@injectable()
export class GameServerSub extends NatsSubscriber implements IGameServerSub {
	constructor() {
		super();
	}

	async startListening(): Promise<void> {
		await Promise.all([this.listenInitGameServer]);
	}

	private async listenInitGameServer(): Promise<void> {
		this.subscribe(GAME_SERVER_INIT, async (_event: string, _payload: string) => {
			// TODO:
		});
	}
}
