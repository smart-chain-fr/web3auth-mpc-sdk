"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = __importDefault(require("../Modal/store"));
const Modal_1 = require("../enums/Modal");
const utils_1 = __importDefault(require("../utils"));
const style_1 = require("./style");
class SignInUp extends HTMLElement {
    constructor() {
        super();
        this.render = () => { };
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.store = store_1.default.getInstance();
        this.getPreSetRender = () => {
            (0, utils_1.default)(`<style>${this.getStyle()}</style>`, this.rootElement);
            const button = (0, utils_1.default)(`<button class="test">Bonjour</button>`, this.rootElement);
            return () => {
                button.onclick = () => {
                    this.store.state = {
                        ...this.store.state,
                        currentStep: Modal_1.ModalStep.VerifyingCode,
                    };
                };
            };
        };
    }
    connectedCallback() {
        this.render = this.getPreSetRender();
        this.render();
    }
    disconnectedCallback() {
        console.log("disconnectedCallback", this);
    }
    getStyle() {
        return style_1.SignInUpStyle;
    }
}
exports.default = SignInUp;
