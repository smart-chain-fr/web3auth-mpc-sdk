import ModalStore from "../Modal/store";
import { createElementFromString } from "../utils/domUtils";
import { VerifyCodeStyle } from "./style";

export default class VerifyCode extends HTMLElement {
  private render: (() => void) | null = null;
  private rootElement: ShadowRoot = this.attachShadow({ mode: "closed" });
  private store = ModalStore.getInstance();
  //   private pinCode: string = "";

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

    return () => {};
  };

  //   private inputChangeHandler(value: string) {
  //     this.pinCode = value;
  //   }

  private getStyle() {
    return VerifyCodeStyle;
  }
}
