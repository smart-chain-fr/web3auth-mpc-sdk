import { IButtonProps } from "../Button";
import { IInputProps } from "../EmailAddressInput";
import ModalStore from "../Modal/store";
import { ModalStep } from "../enums/Modal";
import { createElementFromString } from "../utils/domUtils";
import { SignInUpStyle } from "./style";

export default class SignUp extends HTMLElement {
  private render: (() => void) | null = null;
  private rootElement: ShadowRoot = this.attachShadow({ mode: "closed" });
  private store = ModalStore.getInstance();
  private userEmailAddress: string = "";

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
    const subtitleElement = createElementFromString(
      `<p class="subtitle">Already have an account?</p>`,
      this.rootElement
    );
    const switchCurrentStepElement = createElementFromString(`<span class="switch">Sign in</span>`, subtitleElement);
    switchCurrentStepElement.onclick = () => this.toggleSignInUp();
    const emailAddressInputElement = createElementFromString(
      `<w3ac-email-address-input></w3ac-email-address-input>`,
      this.rootElement
    ) as HTMLElement & IInputProps;
    emailAddressInputElement.onInputChange = (value) => this.inputChangeHandler(value);
    const connectButton = createElementFromString(
      `<w3ac-button text="Create account" variant="primary"></w3ac-button>`,
      this.rootElement
    ) as HTMLElement & IButtonProps;
    connectButton.onClick = () => this.onConnectButtonClick();
    createElementFromString(
      `<div class="separator">
        <span class="line"></span>
        <span class="separator-text">or</span>
        <span class="line"></span>
      </div>`,
      this.rootElement
    );
    createElementFromString(
      `<w3ac-button text="Connect wallet" variant="secondary"></w3ac-button>`,
      this.rootElement
    ) as HTMLElement & IButtonProps;

    return () => {};
  };

  private onConnectButtonClick() {
    console.log(this.userEmailAddress);
    // TODO: Call API endpoint to send email
  }

  private inputChangeHandler(value: string) {
    this.userEmailAddress = value;
  }

  private toggleSignInUp() {
    this.store.state = {
      ...this.store.state,
      currentStep: ModalStep.SignIn,
    };
  }

  private getStyle() {
    return SignInUpStyle;
  }
}
