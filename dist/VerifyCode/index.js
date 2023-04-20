"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = __importDefault(require("../Modal/store"));
const domUtils_1 = require("../utils/domUtils");
const style_1 = require("./style");
class VerifyCode extends HTMLElement {
    constructor() {
        super();
        this.render = null;
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.store = store_1.default.getInstance();
        this.getPreSetRender = () => {
            (0, domUtils_1.createElementFromString)(`<style>${this.getStyle()}</style>`, this.rootElement);
            (0, domUtils_1.createElementFromString)(`<p class="subtitle">We have sent a verification code at ${this.store.state.userEmail}.</p>`, this.rootElement);
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
    getStyle() {
        return style_1.VerifyCodeStyle;
    }
}
exports.default = VerifyCode;
