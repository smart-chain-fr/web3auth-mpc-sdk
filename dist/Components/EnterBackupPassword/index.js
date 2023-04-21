"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domUtils_1 = require("../../utils/domUtils");
const style_1 = require("./style");
class EnterBackupPassword extends HTMLElement {
    constructor() {
        super();
        this.render = null;
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.placeholder = "Enter your password";
        this.userPassword = "";
    }
    connectedCallback() {
        var _a;
        (_a = this.render) !== null && _a !== void 0 ? _a : (this.render = this.getPreSetRender());
        this.render();
    }
    disconnectedCallback() {
        console.log("disconnectedCallback", this);
    }
    getPreSetRender() {
        (0, domUtils_1.createElementFromString)(`<style>${this.getStyle()}</style>`, this.rootElement);
        (0, domUtils_1.createElementFromString)(`<p class="label">Password</p>`, this.rootElement);
        const passwordInputElement = (0, domUtils_1.createElementFromString)(`<input class="input" type="password" class="input" placeholder="${this.placeholder}" />`, this.rootElement);
        passwordInputElement.onchange = passwordInputElement.oninput = () => this.onInputChange(passwordInputElement.value);
        const buttonElement = (0, domUtils_1.createElementFromString)(`<w3ac-button text="Connect" variant="primary"></w3ac-button>`, this.rootElement);
        buttonElement.onClick = () => this.onButtonClick();
        return () => { };
    }
    onButtonClick() {
        console.log("onButtonClick", this.userPassword);
    }
    onInputChange(value) {
        this.userPassword = value;
    }
    getStyle() {
        return style_1.EnterBackupPasswordStyle;
    }
}
exports.default = EnterBackupPassword;
