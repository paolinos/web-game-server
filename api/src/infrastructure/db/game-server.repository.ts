import { inject, injectable } from "inversify";
import { IOC_TYPES } from "../../ioc.types";
import { IDBContext } from "./db.context";
import { DB_COLLECTION } from "./db.types";

export interface GameServerRequirements {
    players_required: number
}

export interface GameServerEntity {
	id: string;
	name: string;
	host: string; // NOTE: Host or IP of the Game Server
	lastUpdate: Date;
	timestamp: number;
    requirements: GameServerRequirements
}

export interface IGameServerRepository {
	getAll(): Promise<GameServerEntity[]>;

	getByName(name: string): Promise<GameServerEntity | undefined>;

	add(id: string, name: string, host: string, requirements: GameServerRequirements): Promise<GameServerEntity>;

	update(gameServer: GameServerEntity): Promise<void>;

	delete(id: string): Promise<void>;
}

@injectable()
export class GameServerRepository implements IGameServerRepository {
	constructor(
		@inject(IOC_TYPES.DBContext) private readonly dbContext: IDBContext,
	) {}

	async getByName(name: string): Promise<GameServerEntity | undefined> {
		return this.dbContext.getItemByKey<GameServerEntity, string>(
			DB_COLLECTION.GAME_SERVER,
			"name",
			name,
		);
	}

	async getAll(): Promise<GameServerEntity[]> {
		return this.dbContext.getAll<GameServerEntity>(DB_COLLECTION.GAME_SERVER);
	}

	async add(id: string, name: string, host: string, requirements: GameServerRequirements): Promise<GameServerEntity> {
		let item: GameServerEntity = {
			id,
			name,
			host,
			lastUpdate: new Date(),
			timestamp: Date.now(),
            requirements
		};
		this.dbContext.addItem<GameServerEntity>(DB_COLLECTION.GAME_SERVER, item);
		return item;
	}

	async update(gameServer: GameServerEntity): Promise<void> {
        await this.dbContext.updateItem<GameServerEntity>(DB_COLLECTION.GAME_SERVER, gameServer);
    }

	async delete(id: string): Promise<void> {
		await this.dbContext.deleteItem(DB_COLLECTION.GAME_SERVER, id);
	}
}
