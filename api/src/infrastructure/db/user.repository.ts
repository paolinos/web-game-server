import { inject, injectable } from "inversify";
import { IOC_TYPES } from "../../ioc.types";
import { IDBContext } from "./db.context";
import { UserModel } from "../../domain/models/user.model";
import { randomUUID } from "crypto";
import { DB_COLLECTION } from "./db.types";

export interface UserEntity extends UserModel {
	id: string;
}

export interface IUserRepository {
	getByEmail(email: string): Promise<UserEntity | undefined>;

	addUser(email: string, password: string, token?: string): Promise<UserEntity>;

	updateUser(user: UserEntity): Promise<void>;

	deleteUser(email: string): Promise<void>;
}

@injectable()
export class UserRepository implements IUserRepository {
	constructor(
		@inject(IOC_TYPES.DBContext) private readonly dbContext: IDBContext,
	) {}

	async getByEmail(email: string): Promise<UserEntity | undefined> {
		const col = (await this.dbContext.getAll(
			DB_COLLECTION.USER,
		)) as UserEntity[];
		return col.find((q) => q.email === email);
	}

	async addUser(
		email: string,
		password: string,
		token?: string,
	): Promise<UserEntity> {
		const user: UserEntity = {
			id: randomUUID(),
			email,
			password,
			lastAccess: new Date(),
			token,
		};
		await this.dbContext.addItem<UserEntity>(DB_COLLECTION.USER, user);
		return user;
	}

	async updateUser(user: UserEntity): Promise<void> {
		await this.dbContext.updateItem<UserEntity>(DB_COLLECTION.USER, user);
	}

	async deleteUser(id: string): Promise<void> {
		await this.dbContext.deleteItem(DB_COLLECTION.USER, id);
	}
}
