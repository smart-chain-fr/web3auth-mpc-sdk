import { createElementFromString } from "../utils/domUtils";
import { ButtonStyle } from "./style";

export enum ButtonVariant {
  Primary = "primary",
  Secondary = "secondary",
}

export interface IButtonProps {
  onClick?: (() => void) | null;
  text: string;
  variant: ButtonVariant;
}

export default class Button extends HTMLElement {
  private render: (() => void) | null = null;
  private onClick: IButtonProps["onClick"] = null;
  private rootElement = this.attachShadow({ mode: "closed" });
  private text: string = "";
  private variant: ButtonVariant | null = null;

  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["text", "variant"];
  }

  public connectedCallback(): void {
    this.render ??= this.getPreSetRender();
    this.render();
  }

  public attributeChangedCallback(name: keyof IButtonProps, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case "text":
        this.text = newValue;
        break;

      case "variant":
        this.variant = newValue as ButtonVariant;

      default:
        break;
    }
    this.render?.();
  }

  public disconnectedCallback(): void {
    console.log("disconnectedCallback", this);
  }

  private getPreSetRender() {
    createElementFromString(`<style>${this.getStyle()}</style>`, this.rootElement);
    const buttonElement = createElementFromString(`<button class="button" type="button"></button>`, this.rootElement);
    buttonElement.onclick = () => this.onClickHandler();

    return () => {
      buttonElement.textContent = this.text;
      if (this.variant) buttonElement.classList.add(this.variant);
    };
  }

  private onClickHandler() {
    this.onClick?.();
  }

  private getStyle() {
    return ButtonStyle;
  }
}
