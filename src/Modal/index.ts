import { ModalStep } from "../enums/Modal";
import SignInUp from "./SignInUp";
import ModalStore from "./store";

export interface IModalProps {
  onCloseButtonClick?: (() => void) | null;
}

export default class Modal extends HTMLElement {
  private _onCloseButtonClick: IModalProps["onCloseButtonClick"] = null;
  private _style = document.createElement("style");
  private _removeOnStateChange = () => {};
  protected _rootElement: ShadowRoot;
  protected _children = document.createElement("div");
  protected _store = ModalStore.getInstance();

  constructor() {
    super();
    this._rootElement = this.attachShadow({ mode: "closed" });
    this.setFontFamily();
    this.setStyle();
  }

  public connectedCallback(): void {
    this._removeOnStateChange = this._store.onChange(() => this.render());
    this.setChildren();
    this.render();
  }

  public disconnectedCallback(): void {
    this._removeOnStateChange();
  }

  private render() {
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
    popup?.appendChild(this._children);
    this._rootElement.appendChild(this._style);
  }

  private setChildren() {
    switch (this._store.state.currentStep) {
      case ModalStep.SignIn:
      case ModalStep.SignUp:
        this._children.appendChild(SignInUp.getInstance()._content);
        break;

      default:
        break;
    }
  }

  public get onCloseButtonClick() {
    return this._onCloseButtonClick;
  }

  public set onCloseButtonClick(onCloseButtonClick: IModalProps["onCloseButtonClick"]) {
    this._onCloseButtonClick = onCloseButtonClick;
    const closeButton = this._rootElement.getElementById("w3ac-close-button");
    if (closeButton && this._onCloseButtonClick) {
      closeButton.onclick = this._onCloseButtonClick;
    }
  }

  private setFontFamily() {
    const font = document.createElement("link");
    font.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    font.rel = "stylesheet";
    document.head.appendChild(font);
  }

  private setStyle() {
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
