"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domUtils_1 = require("../utils/domUtils");
const style_1 = require("./style");
const message_1 = require("../assets/message");
class EmailAddressInput extends HTMLElement {
    constructor() {
        super();
        this.render = null;
        this.placeholder = "Email address";
        this.onInputChange = null;
        this.rootElement = this.attachShadow({ mode: "closed" });
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
        const containerElement = (0, domUtils_1.createElementFromString)(`<div class="container"></div>`, this.rootElement);
        (0, domUtils_1.createElementFromString)(`<p class="label">Email</p>`, containerElement);
        const inputContainerElement = (0, domUtils_1.createElementFromString)(`<div class="input-container"></div`, containerElement);
        (0, domUtils_1.createElementFromString)(message_1.MessageIconSvg, inputContainerElement);
        const inputElement = (0, domUtils_1.createElementFromString)(`<input type="text" class="input" />`, inputContainerElement);
        inputElement.placeholder = this.placeholder;
        inputElement.onchange = inputElement.oninput = () => this.inputChangeHandler(inputElement.value);
        return () => { };
    }
    inputChangeHandler(value) {
        var _a;
        (_a = this.onInputChange) === null || _a === void 0 ? void 0 : _a.call(this, value);
    }
    getStyle() {
        return style_1.EmailAddressInputStyle;
    }
}
exports.default = EmailAddressInput;
