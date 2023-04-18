"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Modal_1 = require("../../enums/Modal");
const store_1 = __importDefault(require("../store"));
class SignInUp {
    constructor() {
        this._store = store_1.default.getInstance();
        this._style = document.createElement("style");
        this._content = document.createElement("div");
        this.setStyle();
        this.setContent();
    }
    static getInstance() {
        var _a;
        return (this.instance = (_a = this.instance) !== null && _a !== void 0 ? _a : new SignInUp());
    }
    setStyle() {
        this._style.innerHTML = `
      .button {
        width: 100%;
        height: 40px;
        background-color: #000000;
        border: none;
        border-radius: 5px;
        color: #ffffff;
        font-size: 16px;
        font-weight: 600;
        margin-top: 10px;
        cursor: pointer;
      }
    `;
    }
    setContent() {
        const button = document.createElement("button");
        button.classList.add("button");
        button.innerText = "Click me";
        button.onclick = () => {
            this._store.state = {
                ...this._store.state,
                currentStep: Modal_1.ModalStep.EnterBackupPassword,
            };
        };
        this._content.appendChild(button);
    }
}
exports.default = SignInUp;
