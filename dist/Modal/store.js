"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter_1 = __importDefault(require("../Services/EventEmitter"));
const Modal_1 = require("../enums/Modal");
class ModalStore {
    constructor() {
        this.event = new EventEmitter_1.default();
        this._state = {
            currentStep: Modal_1.ModalStep.SignIn,
        };
    }
    static getInstance() {
        var _a;
        return (this.instance = (_a = this.instance) !== null && _a !== void 0 ? _a : new ModalStore());
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
exports.default = ModalStore;
