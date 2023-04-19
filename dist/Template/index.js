"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
const store_1 = __importDefault(require("../Modal/store"));
class Template extends HTMLElement {
    constructor({ style }) {
        super();
        this.render = () => { };
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.modalStore = store_1.default.getInstance();
        this.getPreSetRender = () => {
            return () => { };
        };
        this._style = style;
    }
    connectedCallback() {
        this.render = this.getPreSetRender();
        this.render();
    }
    disconnectedCallback() {
        console.log("disconnectedCallback");
    }
    getStyle() {
        return this._style;
    }
}
exports.Template = Template;
