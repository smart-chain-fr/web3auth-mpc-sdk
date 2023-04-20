import { IButtonProps } from "../Button";
import { IInputProps } from "../EmailAddressInput";
import ModalStore from "../Modal/store";
import { ModalStep } from "../enums/Modal";
import { createElementFromString } from "../utils/domUtils";
import { SignInUpStyle } from "./style";

export default class SignIn extends HTMLElement {
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
    const subtitleElement = createElementFromString(`<p class="subtitle">Don't have an account?</p>`, this.rootElement);
    const switchCurrentStepElement = createElementFromString(
      `<span class="switch">Create account</span>`,
      subtitleElement
    );
    switchCurrentStepElement.onclick = () => this.toggleSignInUp();
    const emailAddressInputElement = createElementFromString(
      `<w3ac-email-address-input></w3ac-email-address-input>`,
      this.rootElement
    ) as HTMLElement & IInputProps;
    emailAddressInputElement.onInputChange = (value) => this.inputChangeHandler(value);
    const connectButton = createElementFromString(
      `<w3ac-button text="Connect" variant="primary"></w3ac-button>`,
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
    this.storeUserEmail();
    // TODO: Call API endpoint to send email
    this.goToVerifyCode();
  }

  private storeUserEmail() {
    this.store.state = {
      ...this.store.state,
      userEmail: this.userEmailAddress,
    };
  }

  private inputChangeHandler(value: string) {
    this.userEmailAddress = value;
  }

  private goToVerifyCode() {
    this.store.state = {
      ...this.store.state,
      currentStep: ModalStep.VerifyingCode,
    };
  }

  private toggleSignInUp() {
    this.store.state = {
      ...this.store.state,
      currentStep: ModalStep.SignUp,
    };
  }

  private getStyle() {
    return SignInUpStyle;
  }
}
