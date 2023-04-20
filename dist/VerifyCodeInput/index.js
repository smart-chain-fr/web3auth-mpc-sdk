"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domUtils_1 = require("../utils/domUtils");
const style_1 = require("./style");
const paste_1 = require("../assets/paste");
class VerifyCodeInput extends HTMLElement {
    constructor() {
        super();
        this.render = null;
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.onInputChange = null;
        this.pasteContent = "";
        this.getPreSetRender = () => {
            (0, domUtils_1.createElementFromString)(`<style>${this.getStyle()}</style>`, this.rootElement);
            (0, domUtils_1.createElementFromString)(`<p class="label">Verification code</p>`, this.rootElement);
            const inputContainerElement = (0, domUtils_1.createElementFromString)(`<div class="input-container"></div>`, this.rootElement);
            const verifyCodeInputElement = (0, domUtils_1.createElementFromString)(`<input class="input" type="text" class="input" />`, inputContainerElement);
            const pasteButtonElement = (0, domUtils_1.createElementFromString)(`<button type="button" class="past-button"></button>`, inputContainerElement);
            (0, domUtils_1.createElementFromString)(paste_1.PasteIconSvg, pasteButtonElement);
            (0, domUtils_1.createElementFromString)(`<span>Paste</span>`, pasteButtonElement);
            pasteButtonElement.onclick = () => this.pasteButtonClickHandler();
            verifyCodeInputElement.onchange = verifyCodeInputElement.oninput = () => this.inputChangeHandler(verifyCodeInputElement.value);
            return () => {
                verifyCodeInputElement.value = this.pasteContent;
            };
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
    pasteButtonClickHandler() {
        navigator.clipboard.readText().then((text) => {
            var _a;
            this.inputChangeHandler(text);
            this.pasteContent = text;
            (_a = this.render) === null || _a === void 0 ? void 0 : _a.call(this);
        });
    }
    inputChangeHandler(value) {
        var _a;
        (_a = this.onInputChange) === null || _a === void 0 ? void 0 : _a.call(this, value);
    }
    getStyle() {
        return style_1.VerifyCodeInputStyle;
    }
}
exports.default = VerifyCodeInput;
