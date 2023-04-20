"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domUtils_1 = require("../utils/domUtils");
const style_1 = require("./style");
class Input extends HTMLElement {
    constructor() {
        super();
        this.render = null;
        this.placeholder = "";
        this._icon = "";
        this._onInputChange = null;
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.iconElement = null;
    }
    static get observedAttributes() {
        return ["placeholder", "icon"];
    }
    get icon() {
        return this._icon;
    }
    set icon(icon) {
        this.createUpdateIconElement(icon);
        this._icon = icon;
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
        this[name] = newValue;
        (_a = this.render) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    disconnectedCallback() {
        console.log("disconnectedCallback", this);
    }
    getPreSetRender() {
        (0, domUtils_1.createElementFromString)(`<style>${this.getStyle()}</style>`, this.rootElement);
        const inputContainerElement = (0, domUtils_1.createElementFromString)(`<div class="input-container"></div`, this.rootElement);
        if (this.iconElement)
            inputContainerElement.appendChild(this.iconElement);
        const inputElement = (0, domUtils_1.createElementFromString)(`<input type="text" class="input" id="w3ac-input" />`, inputContainerElement);
        return () => {
            inputElement.placeholder = this.placeholder;
            inputElement.onchange = inputElement.oninput = () => { var _a; return (_a = this._onInputChange) === null || _a === void 0 ? void 0 : _a.call(this, inputElement.value); };
        };
    }
    createUpdateIconElement(icon) {
        var _a;
        if (!icon.trim()) {
            icon = "<span></span>";
        }
        const iconElement = (0, domUtils_1.createElementFromString)(icon);
        (_a = this.iconElement) === null || _a === void 0 ? void 0 : _a.replaceWith(iconElement);
        this.iconElement = iconElement;
    }
    get onInputChange() {
        return this._onInputChange;
    }
    set onInputChange(value) {
        this._onInputChange = value;
        this.applyOnInputChange();
    }
    applyOnInputChange() {
        const inputElement = this.rootElement.getElementById("w3ac-input");
        if (inputElement && this._onInputChange) {
            inputElement.oninput = () => { var _a; return (_a = this._onInputChange) === null || _a === void 0 ? void 0 : _a.call(this, inputElement.value); };
        }
    }
    getStyle() {
        return style_1.InputStyle;
    }
}
exports.default = Input;
