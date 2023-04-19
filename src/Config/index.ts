import developmentConfig from "./development.json";
import preprodConfig from "./preprod.json";
import productionConfig from "./production.json";
import stagingConfig from "./staging.json";

export default class Config {
	private static ctx: Config;

	private config: typeof developmentConfig = developmentConfig;

	private constructor() {
		Config.ctx = this;
		this.setConfig();
	}

	public static getInstance() {
		if (!Config.ctx) return new this();
		return Config.ctx;
	}

	public get() {
		return this.config;
	}

	private setConfig() {
		switch (process.env["REACT_APP_ENV_NAME"]) {
			case "staging":
				this.config = stagingConfig;
				break;
			case "preprod":
				this.config = preprodConfig;
				break;
			case "production":
				this.config = productionConfig;
				break;
		}
	}
}
