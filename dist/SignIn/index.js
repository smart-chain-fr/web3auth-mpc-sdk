"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = __importDefault(require("../Modal/store"));
const Modal_1 = require("../enums/Modal");
const domUtils_1 = require("../utils/domUtils");
const style_1 = require("./style");
class SignIn extends HTMLElement {
    constructor() {
        super();
        this.render = null;
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.store = store_1.default.getInstance();
        this.userEmailAddress = "";
        this.getPreSetRender = () => {
            (0, domUtils_1.createElementFromString)(`<style>${this.getStyle()}</style>`, this.rootElement);
            const subtitleElement = (0, domUtils_1.createElementFromString)(`<p class="subtitle">Don't have an account?</p>`, this.rootElement);
            const switchCurrentStepElement = (0, domUtils_1.createElementFromString)(`<span class="switch">Create account</span>`, subtitleElement);
            switchCurrentStepElement.onclick = () => this.toggleSignInUp();
            const emailAddressInputElement = (0, domUtils_1.createElementFromString)(`<w3ac-email-address-input></w3ac-email-address-input>`, this.rootElement);
            emailAddressInputElement.onInputChange = (value) => this.inputChangeHandler(value);
            const connectButton = (0, domUtils_1.createElementFromString)(`<w3ac-button text="Connect" variant="primary"></w3ac-button>`, this.rootElement);
            connectButton.onClick = () => this.onConnectButtonClick();
            (0, domUtils_1.createElementFromString)(`<div class="separator">
        <span class="line"></span>
        <span class="separator-text">or</span>
        <span class="line"></span>
      </div>`, this.rootElement);
            (0, domUtils_1.createElementFromString)(`<w3ac-button text="Connect wallet" variant="secondary"></w3ac-button>`, this.rootElement);
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
    onConnectButtonClick() {
        this.storeUserEmail();
        this.goToVerifyCode();
    }
    storeUserEmail() {
        this.store.state = {
            ...this.store.state,
            userEmail: this.userEmailAddress,
        };
    }
    inputChangeHandler(value) {
        this.userEmailAddress = value;
    }
    goToVerifyCode() {
        this.store.state = {
            ...this.store.state,
            currentStep: Modal_1.ModalStep.VerifyingCode,
        };
    }
    toggleSignInUp() {
        this.store.state = {
            ...this.store.state,
            currentStep: Modal_1.ModalStep.SignUp,
        };
    }
    getStyle() {
        return style_1.SignInUpStyle;
    }
}
exports.default = SignIn;
