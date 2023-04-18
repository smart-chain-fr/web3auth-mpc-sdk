"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Modal_1 = require("../enums/Modal");
const SignInUp_1 = __importDefault(require("./SignInUp"));
const store_1 = __importDefault(require("./store"));
class Modal extends HTMLElement {
    constructor() {
        super();
        this._onCloseButtonClick = null;
        this._style = document.createElement("style");
        this._removeOnStateChange = () => { };
        this._children = document.createElement("div");
        this._store = store_1.default.getInstance();
        this._rootElement = this.attachShadow({ mode: "closed" });
        this.setFontFamily();
        this.setStyle();
    }
    connectedCallback() {
        this._removeOnStateChange = this._store.onChange(() => this.render());
        this.setChildren();
        this.render();
    }
    disconnectedCallback() {
        this._removeOnStateChange();
    }
    render() {
        this._rootElement.innerHTML = `
        <div class="popup" id="w3ac-popup">
            <div class="header">
                <p class="title" id="w3ac-popup-title">${this._store.state.currentStep}</p>
                <div id="w3ac-close-button" class="close-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                        <path d="M6 18L18 6M6 6L18 18" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        </div>`;
        const popup = this._rootElement.getElementById("w3ac-popup");
        popup === null || popup === void 0 ? void 0 : popup.appendChild(this._children);
        this._rootElement.appendChild(this._style);
    }
    setChildren() {
        switch (this._store.state.currentStep) {
            case Modal_1.ModalStep.SignIn:
            case Modal_1.ModalStep.SignUp:
                this._children.appendChild(SignInUp_1.default.getInstance()._content);
                break;
            default:
                break;
        }
    }
    get onCloseButtonClick() {
        return this._onCloseButtonClick;
    }
    set onCloseButtonClick(onCloseButtonClick) {
        this._onCloseButtonClick = onCloseButtonClick;
        const closeButton = this._rootElement.getElementById("w3ac-close-button");
        if (closeButton && this._onCloseButtonClick) {
            closeButton.onclick = this._onCloseButtonClick;
        }
    }
    setFontFamily() {
        const font = document.createElement("link");
        font.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
        font.rel = "stylesheet";
        document.head.appendChild(font);
    }
    setStyle() {
        this._style.innerHTML = `
    .popup {
        padding: 16px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #FFFFFF;
        border-radius: 16px;
        box-shadow: 0px 6px 12px rgba(17, 24, 39, 0.11);
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 493px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .title {
        margin: 0;
        font-family: "Inter";
        font-weight: 700;
        font-size: 24px;
        line-height: 32px;
        color: #111827;
        letter-spacing: -0.02em;
    }
    
    .close-button {
        cursor: pointer;
    }
    
    .children {
        width: 100%;
        height: 100px;
    }`;
    }
}
exports.default = Modal;
