"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Modal extends HTMLElement {
    constructor() {
        super();
        this._style = document.createElement("style");
        this._children = document.createElement("div");
        this._onCloseButtonClick = null;
        this._popupTitle = "";
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.setFontFamily();
        this.setStyle();
    }
    static get observedAttributes() {
        return ["title"];
    }
    connectedCallback() {
        this.initChildrenDiv();
        this.render();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this.updateProperty(name, newValue);
        this.render();
    }
    render() {
        this.rootElement.innerHTML = `
        <div class="popup">
            <div class="header">
                <p class="title" id="w3ac-popup-title">${this._popupTitle}</p>
                <div id="w3ac-close-button" class="close-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                        <path d="M6 18L18 6M6 6L18 18" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            ${this._children.outerHTML}
        </div>`;
        this.rootElement.appendChild(this._style);
    }
    get onCloseButtonClick() {
        return this._onCloseButtonClick;
    }
    set onCloseButtonClick(onCloseButtonClick) {
        this._onCloseButtonClick = onCloseButtonClick;
        const closeButton = this.rootElement.getElementById("w3ac-close-button");
        if (closeButton && this._onCloseButtonClick) {
            closeButton.onclick = this._onCloseButtonClick;
        }
    }
    get popupTitle() {
        return this._popupTitle;
    }
    updateProperty(name, newValue) {
        switch (name) {
            case "title":
                this._popupTitle = newValue;
                break;
            default:
                break;
        }
    }
    initChildrenDiv() {
        this._children.classList.add("children");
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
