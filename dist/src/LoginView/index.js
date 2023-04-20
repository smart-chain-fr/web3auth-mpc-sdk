"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("./store");
class LoginView extends HTMLElement {
    constructor() {
        super();
        this._style = document.createElement("style");
        this.store = new store_1.LoginViewStore();
        this.removeStore = () => { };
        this.rootElement = this.attachShadow({ mode: "closed" });
        this.setStyle();
    }
    connectedCallback() {
        this.removeStore = this.store.onChange(() => this.render());
        this.render();
    }
    disconnectedCallback() {
        this.removeStore();
    }
    render() {
        const popup = document.createElement("div");
        popup.classList.add("popup");
        popup.onclick = () => this.onClick();
        const popupContent = document.createElement("div");
        popupContent.classList.add("popup-content");
        popupContent.innerText = this.store.state.message;
        popup.appendChild(popupContent);
        this.rootElement.appendChild(this._style);
        this.rootElement.appendChild(popup);
    }
    setStyle() {
        this._style.innerHTML = `
    .popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        height: 300px;
        background: #fff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .popup-content {
        font-size: 20px;
        font-weight: bold;
        color: #333;
    }`;
    }
    onClick() {
        console.log("click");
        this.store.state = {
            message: "Hello World 2",
        };
    }
}
exports.default = LoginView;
