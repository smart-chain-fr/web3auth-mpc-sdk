"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const development_json_1 = __importDefault(require("./development.json"));
const preprod_json_1 = __importDefault(require("./preprod.json"));
const production_json_1 = __importDefault(require("./production.json"));
const staging_json_1 = __importDefault(require("./staging.json"));
class Config {
    constructor() {
        this.config = development_json_1.default;
        Config.ctx = this;
        this.setConfig();
    }
    static getInstance() {
        if (!Config.ctx)
            return new this();
        return Config.ctx;
    }
    get() {
        return this.config;
    }
    setConfig() {
        switch (process.env["REACT_APP_ENV_NAME"]) {
            case "staging":
                this.config = staging_json_1.default;
                break;
            case "preprod":
                this.config = preprod_json_1.default;
                break;
            case "production":
                this.config = production_json_1.default;
                break;
        }
    }
}
exports.default = Config;
