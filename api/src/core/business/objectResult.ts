export class ObjectResult<T> {
	private readonly _error: string | null;
	private readonly _data?: T;
	private constructor(error: string | null, data: T | undefined) {
		this._error = error;
		this._data = data;
	}

	isValid() {
		return this._error === null;
	}

	get error(): string {
		return this._error as string;
	}

	get data(): T | undefined {
		return this._data;
	}

	static successResult<T>(data?: T): ObjectResult<T> {
		return new ObjectResult<T>(null, data);
	}

	static errorResult<T>(error: string): ObjectResult<T> {
		return new ObjectResult<T>(error, undefined);
	}
}
