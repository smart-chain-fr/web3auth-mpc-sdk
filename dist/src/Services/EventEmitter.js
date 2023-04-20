"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
class EventEmitter extends events_1.default {
    constructor() {
        super();
        this.setMaxListeners(0);
    }
}
exports.default = EventEmitter;
