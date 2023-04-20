import { ModalStep } from "../enums/Modal";
import { createElementFromString } from "../utils/domUtils";
import ModalStore from "./store";
import { ModalStyle } from "./style";
import { CrossIconSvg } from "../assets/cross";

export interface IModalProps {
  onCloseButtonClick?: (() => void) | null;
}

export default class Modal extends HTMLElement {
  private render: (() => void) | null = null;
  private removeOnStateChange = () => {};
  private rootElement = this.attachShadow({ mode: "closed" });
  private store = ModalStore.getInstance();
  public onCloseButtonClick: IModalProps["onCloseButtonClick"] = null;

  constructor() {
    super();
  }

  public connectedCallback(): void {
    this.render ??= this.getPreSetRender();
    this.removeOnStateChange = this.store.onChange(() => {
      this.render?.();
    });
    this.render();
  }

  public disconnectedCallback(): void {
    this.removeOnStateChange();
  }

  private getPreSetRender() {
    this.setFontFamily();
    createElementFromString(`<style>${this.getStyle()}</style>`, this.rootElement);
    const popupElement = createElementFromString(`<div class="popup"></div>`, this.rootElement);
    const headElement = createElementFromString(`<div class="header"></div>`, popupElement);
    const headTitleElement = createElementFromString(`<p class="title"></p>`, headElement);
    const headCloseElement = createElementFromString(
      `<div id="w3ac-close-button" class="close-button">
            ${CrossIconSvg}
        </div>`,
      headElement
    );
    headCloseElement.onclick = () => this.closeButtonClick();

    let previousStep: ModalStep | null = null;
    let previousStepElement: HTMLElement | null = null;
    const childs: Record<string, HTMLElement> = {
      [ModalStep.SignIn]: createElementFromString("<w3ac-sign-in></w3ac-sign-in>"),
      [ModalStep.SignUp]: createElementFromString("<w3ac-sign-up></w3ac-sign-up>"),
    };
    return () => {
      headTitleElement.innerText = this.store.state.currentStep ?? "";
      const currentStep = this.store.state.currentStep;
      const currentStepElement = childs[currentStep];

      if (currentStep !== previousStep && previousStepElement) {
        previousStepElement.remove();
      }
      if (currentStep !== previousStep && currentStepElement) {
        popupElement.appendChild(currentStepElement);
      }

      previousStepElement = currentStepElement ?? null;
      previousStep = currentStep;
    };
  }

  private closeButtonClick() {
    this.onCloseButtonClick?.();
  }

  private setFontFamily() {
    createElementFromString(
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />`,
      this
    );
  }

  private getStyle() {
    return ModalStyle;
  }
}
