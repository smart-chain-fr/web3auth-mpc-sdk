"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonVariant = void 0;
const domUtils_1 = require("../utils/domUtils");
const style_1 = require("./style");
var ButtonVariant;
(function (ButtonVariant) {
    ButtonVariant["Primary"] = "primary";
    ButtonVariant["Secondary"] = "secondary";
})(ButtonVariant = exports.ButtonVariant || (exports.ButtonVariant = {}));
class Button extends HTMLElement {
    constructor() {
        super();
        this.render = null;
        this.onClick = null;
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.text = "";
        this.variant = null;
    }
    static get observedAttributes() {
        return ["text", "variant"];
    }
    connectedCallback() {
        var _a;
        (_a = this.render) !== null && _a !== void 0 ? _a : (this.render = this.getPreSetRender());
        this.render();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        var _a;
        if (oldValue === newValue)
            return;
        switch (name) {
            case "text":
                this.text = newValue;
                break;
            case "variant":
                this.variant = newValue;
            default:
                break;
        }
        (_a = this.render) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    disconnectedCallback() {
        console.log("disconnectedCallback", this);
    }
    getPreSetRender() {
        (0, domUtils_1.createElementFromString)(`<style>${this.getStyle()}</style>`, this.rootElement);
        const buttonElement = (0, domUtils_1.createElementFromString)(`<button class="button" type="button"></button>`, this.rootElement);
        buttonElement.onclick = () => this.onClickHandler();
        return () => {
            buttonElement.textContent = this.text;
            if (this.variant)
                buttonElement.classList.add(this.variant);
        };
    }
    onClickHandler() {
        var _a;
        (_a = this.onClick) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    getStyle() {
        return style_1.ButtonStyle;
    }
}
exports.default = Button;
