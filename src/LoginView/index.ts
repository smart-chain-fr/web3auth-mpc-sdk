import { LoginViewStore } from "./store";

export interface ILoginViewProps {
  onClose?: (() => void) | null;
}

export default class LoginView extends HTMLElement {
  protected rootElement: ShadowRoot;
  private _style = document.createElement("style");
  private store = new LoginViewStore();
  private _onClose: ILoginViewProps["onClose"] = null;
  private removeStore = () => {};

  constructor() {
    super();
    this.rootElement = this.attachShadow({ mode: "closed" });
    this.setStyle();
  }

  public connectedCallback(): void {
    this.removeStore = this.store.onChange(() => this.render());
    this.render();
  }

  public disconnectedCallback(): void {
    this.removeStore();
  }

  public get onClose() {
    return this._onClose;
  }

  public set onClose(onClose: ILoginViewProps["onClose"]) {
    this._onClose = onClose;
    const closeButton = this.rootElement.getElementById("close-button");
    if (closeButton && this._onClose) {
      closeButton.onclick = this._onClose;
    }
  }

  private render() {
    const popup = document.createElement("div");
    popup.classList.add("popup");

    const popupContent = document.createElement("div");
    popupContent.classList.add("popup-content");
    popupContent.innerText = this.store.state.message;
    popupContent.onclick = () => this.onClick();

    const closeButton = document.createElement("button");
    closeButton.id = "close-button";
    closeButton.innerText = "Close";

    popup.appendChild(popupContent);
    popup.appendChild(closeButton);
    this.rootElement.appendChild(this._style);
    this.rootElement.appendChild(popup);
  }

  private setStyle() {
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
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .popup-content {
        font-size: 20px;
        font-weight: bold;
        color: #333;
    }
    
    button {
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

  private onClick() {
    this.store.state = {
      ...this.store.state,
      message: "Hello World 2",
    };
  }
}
