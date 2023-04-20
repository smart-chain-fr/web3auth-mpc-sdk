import { createElementFromString } from "../utils/domUtils";
import { EmailAddressInputStyle } from "./style";
import { MessageIconSvg } from "../assets/message";

export interface IInputProps {
  onInputChange?: ((value: string) => void) | null;
}

export default class EmailAddressInput extends HTMLElement {
  private render: (() => void) | null = null;
  private placeholder: string = "Email address";
  private onInputChange: IInputProps["onInputChange"] = null;
  private rootElement = this.attachShadow({ mode: "closed" });

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
    const containerElement = createElementFromString(`<div class="container"></div>`, this.rootElement);
    createElementFromString(`<p class="label">Email</p>`, containerElement);
    const inputContainerElement = createElementFromString(`<div class="input-container"></div`, containerElement);
    createElementFromString(MessageIconSvg, inputContainerElement);
    const inputElement = createElementFromString(
      `<input type="text" class="input" />`,
      inputContainerElement
    ) as HTMLInputElement;
    inputElement.placeholder = this.placeholder;
    inputElement.onchange = inputElement.oninput = () => this.inputChangeHandler(inputElement.value);

    return () => {};
  }

  private inputChangeHandler(value: string) {
    this.onInputChange?.(value);
  }

  private getStyle() {
    return EmailAddressInputStyle;
  }
}
