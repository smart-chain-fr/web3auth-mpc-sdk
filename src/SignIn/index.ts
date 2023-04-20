import { IInputProps } from "../EmailAddressInput";
import ModalStore from "../Modal/store";
import { ModalStep } from "../enums/Modal";
import { createElementFromString } from "../utils/domUtils";
import { SignInUpStyle } from "./style";

export default class SignIn extends HTMLElement {
  private render: (() => void) | null = null;
  private rootElement: ShadowRoot = this.attachShadow({ mode: "closed" });
  private store = ModalStore.getInstance();

  constructor() {
    super();
  }

  public connectedCallback(): void {
    this.render ??= this.getPreSetRender();
    this.render();
  }

  public disconnectedCallback(): void {
    console.log("disconnectedCallback", this);
  }

  private getPreSetRender = () => {
    createElementFromString(`<style>${this.getStyle()}</style>`, this.rootElement);
    const subtitleElement = createElementFromString(`<p class="subtitle">Don't have an account?</p>`, this.rootElement);
    const switchCurrentStepElement = createElementFromString(
      `<span class="switch">Create account</span>`,
      subtitleElement
    );
    createElementFromString(`<w3ac-email-address-input></w3ac-email-address-input>`, this.rootElement) as HTMLElement &
      IInputProps;
    switchCurrentStepElement.onclick = () => this.toggleSignInUp();

    return () => {};
  };

  private toggleSignInUp = () => {
    this.store.state = {
      ...this.store.state,
      currentStep: ModalStep.SignUp,
    };
  };

  private getStyle() {
    return SignInUpStyle;
  }
}
