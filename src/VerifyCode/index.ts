import ModalStore from "../Modal/store";
import { IVerifyCodeInputProps } from "../VerifyCodeInput";
import { createElementFromString } from "../utils/domUtils";
import { VerifyCodeStyle } from "./style";

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

    return () => {};
  };

  private inputChangeHandler(value: string) {
    this.pinCode = value;
  }

  private getStyle() {
    return VerifyCodeStyle;
  }
}
