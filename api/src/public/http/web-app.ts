import express from "express";
import * as core from "express-serve-static-core";
//import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/routes";
import config from "../../config";
import { initWebsocket } from "./ws-events";

// TODO: Should be in the ENV
const corsOptions = {
	origin: "*",
	optionsSuccessStatus: 200,
};

export default class WebApp {
	private readonly _app: core.Express;

	private constructor() {
		this._app = express();

		// Settings
		this._app
			//.use(helmet()) // TODO: disable to avoid "Content-Security-Policy" we're going to review it later.
			.use(compression())
			.use(cors(corsOptions))
			.use(morgan("dev", { skip: (_req, _res) => config.isTest }))
			.use(express.urlencoded({ parameterLimit: 100, extended: true }))
			.use(express.json())
			.use("/web", express.static("http"))
			.use(routes);

		this._app.disable("x-powered-by");
	}

	public listen(): void {
		const server = WebApp._http._app.listen(config.restapi_port, () => {
			console.log(`Http server listening at port:${config.restapi_port}`);
		});

		initWebsocket(server);
	}

	private static _http: WebApp;
	static init(): WebApp {
		if (!WebApp._http) {
			WebApp._http = new WebApp();
		}
		return WebApp._http;
	}

	static get app(): core.Express {
		return WebApp._http._app;
	}
}
