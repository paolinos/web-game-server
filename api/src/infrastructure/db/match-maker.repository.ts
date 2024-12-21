import { inject, injectable } from "inversify";
import { IOC_TYPES } from "../../ioc.types";
import { IDBContext } from "./db.context";
import { randomUUID } from "crypto";
import { DB_COLLECTION } from "./db.types";

export interface MatchMakerDataEntity {
	id: string;
	gameName: string;
	userId: string;
	timestamp: number;
}

export interface IMatchMakerRepository {
	getUser(userId: string): Promise<MatchMakerDataEntity | undefined>;

	addUser(gameName: string, userId: string): Promise<void>;

	removeUser(...userIds: string[]): Promise<void>;

	getUsersAvailableByGame(gameName: string): Promise<string[]>;
}

@injectable()
export class MatchMakerRepository implements IMatchMakerRepository {
	constructor(
		@inject(IOC_TYPES.DBContext) private readonly dbContext: IDBContext,
	) {}

	async getUser(userId: string): Promise<MatchMakerDataEntity | undefined> {
		return this.dbContext.getItemByKey<MatchMakerDataEntity, string>(
			DB_COLLECTION.MATCH_MAKER,
			"userId",
			userId,
		);
	}

	async addUser(gameName: string, userId: string): Promise<void> {
		let item: MatchMakerDataEntity = {
			id: randomUUID(),
			gameName,
			userId,
			timestamp: Date.now(),
		};
		this.dbContext.addItem<MatchMakerDataEntity>(
			DB_COLLECTION.MATCH_MAKER,
			item,
		);
	}

	async removeUser(...userIds: string[]): Promise<void> {
		for (const userId of userIds) {
			await this.dbContext.deleteFirstItemByKey(
				DB_COLLECTION.MATCH_MAKER,
				"userId",
				userId,
			);
		}
	}

	async getUsersAvailableByGame(gameName: string): Promise<string[]> {
		const col = (await this.dbContext.getAll(
			DB_COLLECTION.MATCH_MAKER,
		)) as MatchMakerDataEntity[];
		return col.filter((q) => q.gameName === gameName).map((q) => q.userId);
	}
}
