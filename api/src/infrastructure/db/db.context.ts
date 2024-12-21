// TODO:
//import "reflect-metadata";
import { injectable } from "inversify";
//import { IOC_TYPES } from "../../ioc";
//import { INatsConn } from "../nats.connector";

export interface IDBContextDic {
	addItem<T>(collection: string, key: string, value: T): Promise<void>;

	getItem<T>(collection: string, key: string): Promise<T | undefined>;

	deleteItem(collection: string, key: string): Promise<void>;

	updateItem<T>(collection: string, key: string, valiue: T): Promise<void>;

	getAll<T>(collection: string): Promise<Record<string, T>[]>;
}

@injectable()
export class LocalContextDic implements IDBContextDic {
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

export interface DbItem {
	id: string;
}

export interface IDBContext {
	getAll<T extends DbItem>(collection: string): Promise<T[]>;

	addItem<T extends DbItem>(collection: string, value: T): Promise<void>;

	getItem<T extends DbItem>(
		collection: string,
		id: string,
	): Promise<T | undefined>;

	getItemByKey<T extends DbItem, V>(
		collection: string,
		key: string,
		value: V,
	): Promise<T | undefined>;

	updateItem<T extends DbItem>(collection: string, value: T): Promise<void>;

	deleteItem(collection: string, id: string): Promise<void>;

	deleteFirstItemByKey(
		collection: string,
		key: string,
		value: string,
	): Promise<void>;
}

export class LocalContext implements IDBContext {
	private readonly _data: Record<string, DbItem[]> = {};
	constructor() {}

	private getCol(collection: string): DbItem[] {
		let col = this._data[collection];
		if (!col) {
			col = [];
			this._data[collection] = col;
		}
		return col;
	}

	async getAll<T extends DbItem>(collection: string): Promise<T[]> {
		return this.getCol(collection) as T[];
	}

	async addItem<T extends DbItem>(collection: string, value: T): Promise<void> {
		const col = this.getCol(collection);
		col.push(value);
	}
	async getItem<T extends DbItem>(
		collection: string,
		id: string,
	): Promise<T | undefined> {
		const col = this.getCol(collection);
		return col.find((q) => q.id === id) as T;
	}
	async getItemByKey<T extends DbItem, V>(
		collection: string,
		key: string,
		value: V,
	): Promise<T | undefined> {
		const col = this.getCol(collection);
		// @ts-ignore
		return col.find((q) => q[key] === value) as T;
	}

	async updateItem<T extends DbItem>(
		collection: string,
		value: T,
	): Promise<void> {
		const col = this.getCol(collection);
		let item = col.find((q) => q.id === value.id);
		if (item) {
			item = value;
		}
	}

	async deleteItem(collection: string, id: string): Promise<void> {
		const col = this.getCol(collection);
		const pos = col.findIndex((q) => q.id === id);
		if (pos >= 0) {
			col.splice(pos, 1);
		}
	}

	async deleteFirstItemByKey(
		collection: string,
		key: string,
		value: string,
	): Promise<void> {
		const col = this.getCol(collection);
		// @ts-ignore
		const pos = col.findIndex((q) => q[key] === value);
		if (pos >= 0) {
			col.splice(pos, 1);
		}
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
