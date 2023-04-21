import { IButtonProps } from "../Button";
import { createElementFromString } from "../../utils/domUtils";
import { EnterBackupPasswordStyle } from "./style";

export default class EnterBackupPassword extends HTMLElement {
  private render: (() => void) | null = null;
  private rootElement = this.attachShadow({ mode: "closed" });
  private placeholder: string = "Enter your password";
  private userPassword: string = "";

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

  private getPreSetRender() {
    createElementFromString(`<style>${this.getStyle()}</style>`, this.rootElement);
    createElementFromString(`<p class="label">Password</p>`, this.rootElement);
    const passwordInputElement = createElementFromString(
      `<input class="input" type="password" class="input" placeholder="${this.placeholder}" />`,
      this.rootElement
    ) as HTMLInputElement;
    passwordInputElement.onchange = passwordInputElement.oninput = () => this.onInputChange(passwordInputElement.value);

    const buttonElement = createElementFromString(
      `<w3ac-button text="Connect" variant="primary"></w3ac-button>`,
      this.rootElement
    ) as HTMLElement & IButtonProps;
    buttonElement.onClick = () => this.onButtonClick();

    return () => {};
  }

  private onButtonClick() {
    // TODO: Call API to verify account
    console.log("onButtonClick", this.userPassword);
  }

  private onInputChange(value: string) {
    this.userPassword = value;
  }

  private getStyle() {
    return EnterBackupPasswordStyle;
  }
}
