"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ModalStore_1 = __importDefault(require("../../Stores/ModalStore"));
const domUtils_1 = require("../../utils/domUtils");
const style_1 = require("./style");
const refresh_1 = require("../../assets/refresh");
const Modal_1 = require("../../enums/Modal");
class VerifyCode extends HTMLElement {
    constructor() {
        super();
        this.render = null;
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.store = ModalStore_1.default.getInstance();
        this.pinCode = "";
        this.getPreSetRender = () => {
            (0, domUtils_1.createElementFromString)(`<style>${this.getStyle()}</style>`, this.rootElement);
            (0, domUtils_1.createElementFromString)(`<p class="subtitle">We have sent a verification code at ${this.store.state.userEmail}.</p>`, this.rootElement);
            const verifyCodeInputElement = (0, domUtils_1.createElementFromString)(`<w3ac-verify-code-input></w3ac-verify-code-input>`, this.rootElement);
            verifyCodeInputElement.onInputChange = (value) => this.inputChangeHandler(value);
            const resendEmailElement = (0, domUtils_1.createElementFromString)(`<div class="resend-mail"></div>`, this.rootElement);
            resendEmailElement.onclick = () => this.resendEmailClickHandler();
            (0, domUtils_1.createElementFromString)(refresh_1.RefreshIconSvg, resendEmailElement);
            (0, domUtils_1.createElementFromString)(`<span class="resend-mail-text">Resend verification code</span>`, resendEmailElement);
            const buttonElement = (0, domUtils_1.createElementFromString)(`<w3ac-button text="Validate" variant="primary"></w3ac-button>`, this.rootElement);
            buttonElement.onClick = () => this.onButtonClick();
            return () => { };
        };
    }
    connectedCallback() {
        var _a;
        (_a = this.render) !== null && _a !== void 0 ? _a : (this.render = this.getPreSetRender());
        this.render();
    }
    disconnectedCallback() {
        console.log("disconnectedCallback", this);
    }
    onButtonClick() {
        this.storePinCode();
        this.goToEnterPassword();
    }
    resendEmailClickHandler() {
    }
    storePinCode() {
        this.store.state = {
            ...this.store.state,
            pinCode: this.pinCode,
        };
    }
    goToEnterPassword() {
        this.store.state = {
            ...this.store.state,
            currentStep: Modal_1.ModalStep.EnterBackupPassword,
        };
    }
    inputChangeHandler(value) {
        this.pinCode = value;
    }
    getStyle() {
        return style_1.VerifyCodeStyle;
    }
}
exports.default = VerifyCode;
