"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./jsx");
const Modal_1 = __importDefault(require("./Modal"));
const SignInUp_1 = __importDefault(require("./SignInUp"));
customElements.define("w3ac-modal", Modal_1.default);
customElements.define("w3ac-signinup", SignInUp_1.default);
