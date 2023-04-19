import { ModalStep } from "../enums/Modal";
import createElementFromString from "../utils";
import ModalStore from "./store";
import { ModalStyle } from "./style";

export interface IModalProps {
  onCloseButtonClick?: (() => void) | null;
}

export default class Modal extends HTMLElement {
  private render = () => {};
  private removeOnStateChange = () => {};
  private _onCloseButtonClick: IModalProps["onCloseButtonClick"] = null;
  protected rootElement = this.attachShadow({ mode: "closed" });
  protected store = ModalStore.getInstance();

  constructor() {
    super();
  }

  public connectedCallback(): void {
    this.render = this.getPreSetRender();
    this.removeOnStateChange = this.store.onChange(() => {
      this.render();
    });
    this.render();
  }

  public disconnectedCallback(): void {
    this.removeOnStateChange();
  }

  private getPreSetRender = () => {
    this.setFontFamily();
    createElementFromString(`<style>${this.getStyle()}</style>`, this.rootElement);
    const popupElement = createElementFromString(`<div class="popup"></div>`, this.rootElement);
    const headElement = createElementFromString(`<div class="header"></div>`, popupElement);
    const headTitleElement = createElementFromString(`<p class="title" id="w3ac-popup-title"></p>`, headElement);
    const headCloseElement = createElementFromString(
      `<div id="w3ac-close-button" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                <path d="M6 18L18 6M6 6L18 18" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>`,
      headElement
    );

    let previousStep: ModalStep | null = null;
    let previousStepElement: HTMLElement | null = null;
    const childs: Record<string, HTMLElement> = {
      [ModalStep.SignIn]: createElementFromString("<w3ac-sign-in></w3ac-sign-in>"),
      [ModalStep.SignUp]: createElementFromString("<w3ac-sign-up></w3ac-sign-up>"),
    };
    return () => {
      headTitleElement.innerText = this.store.state.currentStep ?? "";
      headCloseElement.onclick = this.onCloseButtonClick ?? (() => {});

      const currentStep = this.store.state.currentStep;
      const currentStepElement = childs[currentStep];

      if (currentStep !== previousStep && previousStepElement) {
        // const shadowRoot = previousStepElement.shadowRoot;
        // if (shadowRoot) {
        //   shadowRoot.innerHTML = "";
        // }
        previousStepElement.remove();
      }
      if (currentStep !== previousStep && currentStepElement) {
        popupElement.appendChild(currentStepElement);
      }

      previousStepElement = currentStepElement ?? null;
      previousStep = currentStep;
    };
  };

  public get onCloseButtonClick() {
    return this._onCloseButtonClick;
  }

  public set onCloseButtonClick(onCloseButtonClick: IModalProps["onCloseButtonClick"]) {
    this._onCloseButtonClick = onCloseButtonClick;
    this.applyOnCloseButtonClick();
  }

  private applyOnCloseButtonClick() {
    const closeButton = this.rootElement.getElementById("w3ac-close-button");
    if (closeButton && this._onCloseButtonClick) {
      closeButton.onclick = this._onCloseButtonClick;
    }
  }

  private setFontFamily() {
    createElementFromString(
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />`,
      this
    );
  }

  public getStyle() {
    return ModalStyle;
  }
}
