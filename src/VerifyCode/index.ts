import ModalStore from "../Modal/store";
import { IVerifyCodeInputProps } from "../VerifyCodeInput";
import { createElementFromString } from "../utils/domUtils";
import { VerifyCodeStyle } from "./style";
import { RefreshIconSvg } from "../assets/refresh";
import { ModalStep } from "../enums/Modal";
import { IButtonProps } from "../Button";

export default class VerifyCode extends HTMLElement {
  private render: (() => void) | null = null;
  private rootElement: ShadowRoot = this.attachShadow({ mode: "closed" });
  private store = ModalStore.getInstance();
  private pinCode: string = "";

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
    createElementFromString(
      `<p class="subtitle">We have sent a verification code at ${this.store.state.userEmail}.</p>`,
      this.rootElement
    );
    const verifyCodeInputElement = createElementFromString(
      `<w3ac-verify-code-input></w3ac-verify-code-input>`,
      this.rootElement
    ) as HTMLElement & IVerifyCodeInputProps;
    verifyCodeInputElement.onInputChange = (value) => this.inputChangeHandler(value);
    const resendEmailElement = createElementFromString(`<div class="resend-mail"></div>`, this.rootElement);
    resendEmailElement.onclick = () => this.resendEmailClickHandler();
    createElementFromString(RefreshIconSvg, resendEmailElement);
    createElementFromString(`<span class="resend-mail-text">Resend verification code</span>`, resendEmailElement);
    const buttonElement = createElementFromString(
      `<w3ac-button text="Validate" variant="primary"></w3ac-button>`,
      this.rootElement
    ) as HTMLElement & IButtonProps;
    buttonElement.onClick = () => this.onButtonClick();

    return () => {};
  };

  private onButtonClick() {
    this.storePinCode();
    this.goToEnterPassword();
  }

  private resendEmailClickHandler() {
    // TODO: Implement resend email
  }

  private storePinCode() {
    this.store.state = {
      ...this.store.state,
      pinCode: this.pinCode,
    };
  }

  private goToEnterPassword() {
    this.store.state = {
      ...this.store.state,
      currentStep: ModalStep.EnterBackupPassword,
    };
  }

  private inputChangeHandler(value: string) {
    this.pinCode = value;
  }

  private getStyle() {
    return VerifyCodeStyle;
  }
}
