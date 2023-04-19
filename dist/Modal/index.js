"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Modal_1 = require("../enums/Modal");
const utils_1 = __importDefault(require("../utils"));
const store_1 = __importDefault(require("./store"));
const style_1 = require("./style");
class Modal extends HTMLElement {
    constructor() {
        super();
        this.render = () => { };
        this.removeOnStateChange = () => { };
        this._onCloseButtonClick = null;
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.store = store_1.default.getInstance();
        this.getPreSetRender = () => {
            this.setFontFamily();
            (0, utils_1.default)(`<style>${this.getStyle()}</style>`, this.rootElement);
            const popupElement = (0, utils_1.default)(`<div class="popup"></div>`, this.rootElement);
            const headElement = (0, utils_1.default)(`<div class="header"></div>`, popupElement);
            const headTitleElement = (0, utils_1.default)(`<p class="title" id="w3ac-popup-title"></p>`, headElement);
            const headCloseElement = (0, utils_1.default)(`<div id="w3ac-close-button" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                <path d="M6 18L18 6M6 6L18 18" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>`, headElement);
            let previousStep = null;
            let previousStepElement = null;
            const childs = {
                [Modal_1.ModalStep.SignIn]: (0, utils_1.default)("<w3ac-signinup></w3ac-signinup>"),
            };
            return () => {
                var _a, _b;
                headTitleElement.innerText = (_a = this.store.state.currentStep) !== null && _a !== void 0 ? _a : "";
                headCloseElement.onclick = (_b = this.onCloseButtonClick) !== null && _b !== void 0 ? _b : (() => { });
                const currentStep = this.store.state.currentStep;
                const currentStepElement = childs[this.store.state.currentStep];
                if (currentStep !== previousStep && previousStepElement)
                    previousStepElement.remove();
                if (currentStep !== previousStep && currentStepElement)
                    popupElement.appendChild(currentStepElement);
                previousStepElement = currentStepElement !== null && currentStepElement !== void 0 ? currentStepElement : null;
                previousStep = this.store.state.currentStep;
            };
        };
    }
    connectedCallback() {
        this.render = this.getPreSetRender();
        this.removeOnStateChange = this.store.onChange(() => {
            this.render();
        });
        this.render();
    }
    disconnectedCallback() {
        this.removeOnStateChange();
    }
    get onCloseButtonClick() {
        return this._onCloseButtonClick;
    }
    set onCloseButtonClick(onCloseButtonClick) {
        this._onCloseButtonClick = onCloseButtonClick;
        this.applyOnCloseButtonClick();
    }
    applyOnCloseButtonClick() {
        const closeButton = this.rootElement.getElementById("w3ac-close-button");
        if (closeButton && this._onCloseButtonClick) {
            closeButton.onclick = this._onCloseButtonClick;
        }
    }
    setFontFamily() {
        (0, utils_1.default)(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />`, this);
    }
    getStyle() {
        return style_1.ModalStyle;
    }
}
exports.default = Modal;
