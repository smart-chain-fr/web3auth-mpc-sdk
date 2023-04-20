import { createElementFromString } from "../utils/domUtils";
import { VerifyCodeInputStyle } from "./style";
import { PasteIconSvg } from "../assets/paste";

export interface IVerifyCodeInputProps {
  onInputChange?: ((value: string) => void) | null;
}

export default class VerifyCodeInput extends HTMLElement {
  private render: (() => void) | null = null;
  private rootElement: ShadowRoot = this.attachShadow({ mode: "closed" });
  private onInputChange: IVerifyCodeInputProps["onInputChange"] = null;
  private pasteContent: string = "";

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
    createElementFromString(`<p class="label">Verification code</p>`, this.rootElement);
    const inputContainerElement = createElementFromString(`<div class="input-container"></div>`, this.rootElement);
    const verifyCodeInputElement = createElementFromString(
      `<input class="input" type="text" class="input" />`,
      inputContainerElement
    ) as HTMLInputElement;
    const pasteButtonElement = createElementFromString(
      `<button type="button" class="past-button"></button>`,
      inputContainerElement
    );
    createElementFromString(PasteIconSvg, pasteButtonElement);
    createElementFromString(`<span>Paste</span>`, pasteButtonElement);
    pasteButtonElement.onclick = () => this.pasteButtonClickHandler();

    return () => {
      verifyCodeInputElement.value = this.pasteContent;
    };
  };

  private pasteButtonClickHandler() {
    navigator.clipboard.readText().then((text) => {
      this.inputChangeHandler(text);
      this.pasteContent = text;
      this.render?.();
    });
  }

  private inputChangeHandler(value: string) {
    this.onInputChange?.(value);
  }

  private getStyle() {
    return VerifyCodeInputStyle;
  }
}
