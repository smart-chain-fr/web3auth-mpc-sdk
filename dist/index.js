"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EmailAddressInput_1 = __importDefault(require("./EmailAddressInput"));
require("./jsx");
const Modal_1 = __importDefault(require("./Modal"));
const SignIn_1 = __importDefault(require("./SignIn"));
const SignUp_1 = __importDefault(require("./SignUp"));
const Button_1 = __importDefault(require("./Button"));
const VerifyCode_1 = __importDefault(require("./VerifyCode"));
customElements.define("w3ac-modal", Modal_1.default);
customElements.define("w3ac-sign-in", SignIn_1.default);
customElements.define("w3ac-sign-up", SignUp_1.default);
customElements.define("w3ac-email-address-input", EmailAddressInput_1.default);
customElements.define("w3ac-button", Button_1.default);
customElements.define("w3ac-verify-code", VerifyCode_1.default);
