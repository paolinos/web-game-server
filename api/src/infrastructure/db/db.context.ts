// TODO:
//import "reflect-metadata";
import { injectable } from "inversify";
//import { IOC_TYPES } from "../../ioc";
//import { INatsConn } from "../nats.connector";

export interface IDBContext {
	addItem<T>(collection: string, key: string, value: T): Promise<void>;

	getItem<T>(collection: string, key: string): Promise<T | undefined>;

	deleteItem(collection: string, key: string): Promise<void>;

	updateItem<T>(collection: string, key: string, valiue: T): Promise<void>;

	getAll<T>(collection: string): Promise<Record<string, T>[]>;
}

@injectable()
export class LocalContext implements IDBContext {
	private readonly _data: Record<string, Record<string, any>[]> = {};
	constructor() {}

	async addItem<T>(collection: string, key: string, value: T): Promise<void> {
		let col = this._data[collection];
		if (!col) {
			this._data[collection] = [];
		}

		const data = {};
		// @ts-ignore
		data[key] = value;
		this._data[collection].push(data);
	}

	async getItem<T>(collection: string, key: string): Promise<T | undefined> {
		const col = this._data[collection];
		if (!col) {
			return undefined;
		}

		const data = col.find((q) => q[key]);
		return data ? data[key] : undefined;
	}
	async updateItem<T>(
		collection: string,
		key: string,
		value: T,
	): Promise<void> {
		const data = this._data[collection].find((q) => q[key])!;
		data[key] = value;
	}

	async getAll<T>(collection: string): Promise<Record<string, T>[]> {
		return this._data[collection];
	}

	async deleteItem(collection: string, key: string): Promise<void> {
		const col = this._data[collection];
		const pos = col.findIndex((q) => q[key]);

		col.splice(pos, 1);
	}
}

/*
@injectable()
export class NatsContext implements IDBContext {
    constructor(
        @inject(IOC_TYPES.NatsConn) private readonly natsConn: INatsConn,
    ){

    }

    addItem<T>(collection:string, key:string, value:T):Promise<void> {

    }

    getItem<T>(collection:string, key:string):Promise<T> {

    }

    deleteItem(collection:string, key:string):Promise<void> {

    }

    getAll<T>(collection:string):Promise<T> {

    }
}
*/
