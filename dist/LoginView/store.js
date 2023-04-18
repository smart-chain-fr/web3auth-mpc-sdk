"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginViewStore = void 0;
const EventEmitter_1 = __importDefault(require("../Services/EventEmitter"));
class LoginViewStore {
    constructor() {
        this.event = new EventEmitter_1.default();
        this._state = {
            message: "Hello World",
        };
    }
    set state(newState) {
        this._state = newState;
        this.event.emit("change");
    }
    get state() {
        return this._state;
    }
    onChange(callback) {
        this.event.on("change", callback);
        return () => {
            this.event.off("change", callback);
        };
    }
}
exports.LoginViewStore = LoginViewStore;
