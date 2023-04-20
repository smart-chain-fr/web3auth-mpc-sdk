"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domUtils_1 = require("../utils/domUtils");
const style_1 = require("./style");
class EnterBackupPassword extends HTMLElement {
    constructor() {
        super();
        this.render = null;
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
        return () => { };
    }
    getStyle() {
        return style_1.EnterBackupPasswordStyle;
    }
}
exports.default = EnterBackupPassword;
