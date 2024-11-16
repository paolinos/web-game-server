import express from "express";
import * as core from "express-serve-static-core";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";

import routes from "./routes/routes";
import config from "../../config";

// TODO: Should be in the ENV
const corsOptions = {
	origin: "*",
	optionsSuccessStatus: 200,
};

export default class RestApi {
	private readonly _app: core.Express;

	private constructor() {
		this._app = express();

		// Settings
		this._app
			.use(helmet())
			.use(compression())
			.use(cors(corsOptions))
			.use(morgan("dev", { skip: (_req, _res) => config.isTest }))
			.use(express.urlencoded({ parameterLimit: 100, extended: true }))
			.use(express.json())
			.use(routes);
	}

	public listen(): void {
		RestApi._api._app.listen(config.restapi_port, () => {
			console.log(`Http server listening at port:${config.restapi_port}`);
		});
	}

	private static _api: RestApi;
	static init(): RestApi {
		if (!RestApi._api) {
			RestApi._api = new RestApi();
		}
		return RestApi._api;
	}

	static get app(): core.Express {
		return RestApi._api._app;
	}
}
