"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Modal_1 = require("../enums/Modal");
const domUtils_1 = require("../utils/domUtils");
const store_1 = __importDefault(require("./store"));
const style_1 = require("./style");
const cross_1 = require("../assets/cross");
class Modal extends HTMLElement {
    constructor() {
        super();
        this.render = null;
        this.removeOnStateChange = () => { };
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.store = store_1.default.getInstance();
        this.onCloseButtonClick = null;
    }
    connectedCallback() {
        var _a;
        (_a = this.render) !== null && _a !== void 0 ? _a : (this.render = this.getPreSetRender());
        this.removeOnStateChange = this.store.onChange(() => {
            var _a;
            (_a = this.render) === null || _a === void 0 ? void 0 : _a.call(this);
        });
        this.render();
    }
    disconnectedCallback() {
        this.removeOnStateChange();
    }
    getPreSetRender() {
        this.setFontFamily();
        (0, domUtils_1.createElementFromString)(`<style>${this.getStyle()}</style>`, this.rootElement);
        const popupElement = (0, domUtils_1.createElementFromString)(`<div class="popup"></div>`, this.rootElement);
        const headElement = (0, domUtils_1.createElementFromString)(`<div class="header"></div>`, popupElement);
        const headTitleElement = (0, domUtils_1.createElementFromString)(`<p class="title"></p>`, headElement);
        const headCloseElement = (0, domUtils_1.createElementFromString)(`<div id="w3ac-close-button" class="close-button">
            ${cross_1.CrossIconSvg}
        </div>`, headElement);
        headCloseElement.onclick = () => this.closeButtonClick();
        let previousStep = null;
        let previousStepElement = null;
        const childs = {
            [Modal_1.ModalStep.SignIn]: (0, domUtils_1.createElementFromString)("<w3ac-sign-in></w3ac-sign-in>"),
            [Modal_1.ModalStep.SignUp]: (0, domUtils_1.createElementFromString)("<w3ac-sign-up></w3ac-sign-up>"),
            [Modal_1.ModalStep.VerifyingCode]: (0, domUtils_1.createElementFromString)("<w3ac-verify-code></w3ac-verify-code>"),
        };
        return () => {
            var _a;
            headTitleElement.innerText = (_a = this.store.state.currentStep) !== null && _a !== void 0 ? _a : "";
            const currentStep = this.store.state.currentStep;
            const currentStepElement = childs[currentStep];
            if (currentStep !== previousStep && previousStepElement) {
                previousStepElement.remove();
            }
            if (currentStep !== previousStep && currentStepElement) {
                popupElement.appendChild(currentStepElement);
            }
            previousStepElement = currentStepElement !== null && currentStepElement !== void 0 ? currentStepElement : null;
            previousStep = currentStep;
        };
    }
    closeButtonClick() {
        var _a;
        (_a = this.onCloseButtonClick) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    setFontFamily() {
        (0, domUtils_1.createElementFromString)(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />`, this);
    }
    getStyle() {
        return style_1.ModalStyle;
    }
}
exports.default = Modal;
