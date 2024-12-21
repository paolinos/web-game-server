import "dotenv/config";

export interface IConfig {
	app_env: string;
	app_name: string;
	app_version: string;
	restapi_port: number;
	nats_host: string;
	jwt_secret: string;
	isTest: boolean;
}

const APP_ENV = {
	TEST: "test",
	PROD: "production",
} as const;

class Config implements IConfig {
	private readonly _app_env: string;
	private readonly _app_name: string;
	private readonly _app_version: string;
	private readonly _restapi_port: number;

	private readonly _nats_host: string;

	private readonly _jwt_secret: string;

	constructor() {
		this._app_env = process.env.APP_ENV || APP_ENV.PROD;
		this._app_name = process.env.APP_NAME || "Base Web Server";
		this._app_version = process.env.APP_VERSION || "v0.0.0";
		this._restapi_port = parseInt(process.env.REST_API_PORT || "8000");

		this._nats_host = process.env.NATS_HOST || "nats.dev:4222";

		this._jwt_secret = process.env.JWT_SECRET || "jwt-secret-fake";
	}

	get isTest(): boolean {
		return this._app_env === APP_ENV.TEST;
	}

	get app_env(): string {
		return this._app_env;
	}
	get app_name(): string {
		return this._app_name;
	}
	get app_version(): string {
		return this._app_version;
	}
	get restapi_port(): number {
		return this._restapi_port;
	}
	get nats_host(): string {
		return this._nats_host;
	}
	get jwt_secret(): string {
		return this._jwt_secret;
	}
}

const config: IConfig = new Config();
export default config;
