import { connect, NatsConnection, StringCodec } from "nats";
import config from "../../config";

export interface INatsConn {
	getConn(): Promise<NatsConnection>;

	close(): Promise<void>;
}

export class NatsConn implements INatsConn {
	private _nc?: NatsConnection;

	async getConn(): Promise<NatsConnection> {
		if (!this._nc) {
			this._nc = await connect({
				servers: config.nats_host,
				//user: "ruser",
				//pass: "T0pS3cr3t",
			});
		}
		return this._nc;
	}

	async close(): Promise<void> {
		if (this._nc) {
			await this._nc.close();
		}
	}
}

export abstract class NatsPublisher {
	private readonly natsConn: INatsConn;

	constructor() {
		// TODO: Review this later
		this.natsConn = new NatsConn();
	}

	protected async publish(event: string, payload: string): Promise<void> {
		const conn = await this.natsConn.getConn();

		const sc = StringCodec();
		conn.publish(event, sc.encode(payload));
	}
}

export abstract class NatsSubscriber {
	private readonly natsConn: INatsConn;

	constructor() {
		// TODO: Review this later
		this.natsConn = new NatsConn();
	}

	protected async subscribe(
		event: string,
		func: (event: string, payload: string) => Promise<void>,
	): Promise<void> {
		const conn = await this.natsConn.getConn();
		const sub = conn.subscribe(event);
		const sc = StringCodec();
		(async () => {
			for await (const m of sub) {
				const payload = sc.decode(m.data);
				console.log(
					`[${sub.getProcessed()}]; subscription:${m.subject}; value:${payload}`,
				);

				await func(m.subject, payload);
			}
			console.log("subscription closed");
		})();
	}
}
