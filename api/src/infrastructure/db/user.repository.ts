//import "reflect-metadata";
import { inject, injectable } from "inversify";
import { IOC_TYPES } from "../../ioc.types";
import { IDBContext } from "./db.context";
import { UserModel } from "../../domain/models/user.model";

export interface IUserRepository {
	getByEmail(email: string): Promise<UserModel | undefined>;

	addUser(email: string, password: string, token?: string): Promise<UserModel>;

	updateUser(user: UserModel): Promise<void>;

	deleteUser(email: string): Promise<void>;
}

@injectable()
export class UserRepository implements IUserRepository {
	constructor(
		@inject(IOC_TYPES.DBContext) private readonly dbContext: IDBContext,
	) {}

	async getByEmail(email: string): Promise<UserModel | undefined> {
		return this.dbContext.getItem<UserModel>("user", email);
	}

	async addUser(
		email: string,
		password: string,
		token?: string,
	): Promise<UserModel> {
		const userModel: UserModel = {
			email,
			password,
			lastAccess: new Date(),
			token,
		};
		await this.dbContext.addItem<UserModel>("user", email, userModel);
		return userModel;
	}

	async updateUser(user: UserModel): Promise<void> {
		await this.dbContext.updateItem<UserModel>("user", user.email, user);
	}

	async deleteUser(email: string): Promise<void> {
		await this.dbContext.deleteItem("user", email);
	}
}
