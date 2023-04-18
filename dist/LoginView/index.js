"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Modal extends HTMLElement {
    constructor() {
        super();
        this._style = document.createElement("style");
        this._onClose = null;
        this._popupTitle = "";
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.setFontFamily();
        this.setStyle();
    }
    static get observedAttributes() {
        return ["title"];
    }
    connectedCallback() {
        this.render();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        switch (name) {
            case "title":
                this._popupTitle = newValue;
                break;
            default:
                break;
        }
        this.render();
    }
    render() {
        this.rootElement.innerHTML = `
        <div class="popup">
            <div class="header">
                <p class="title" id="w3ac-popup-title">${this._popupTitle}</p>
                <button class="close-button" id="w3ac-close-button">Close</button>
            </div>
        </div>`;
        this.rootElement.appendChild(this._style);
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
        width: 100px;
        height: 30px;
        background: #333;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 20px;
    }`;
    }
    setFontFamily() {
        const font = document.createElement("link");
        font.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
        font.rel = "stylesheet";
        document.head.appendChild(font);
    }
    get onClose() {
        return this._onClose;
    }
    set onClose(onClose) {
        this._onClose = onClose;
        const closeButton = this.rootElement.getElementById("w3ac-close-button");
        if (closeButton && this._onClose) {
            closeButton.onclick = this._onClose;
        }
    }
    get popupTitle() {
        return this._popupTitle;
    }
}
exports.default = Modal;
