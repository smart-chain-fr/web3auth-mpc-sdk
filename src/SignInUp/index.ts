import ModalStore from "../Modal/store";
import { ModalStep } from "../enums/Modal";
import createElementFromString from "../utils";
import { SignInUpStyle } from "./style";

export default class SignInUp extends HTMLElement {
  private render = () => {};
  protected rootElement = this.attachShadow({ mode: "closed" });
  protected store = ModalStore.getInstance();

  constructor() {
    super();
  }

  public connectedCallback(): void {
    this.render = this.getPreSetRender();
    this.render();
  }

  public disconnectedCallback(): void {
    console.log("disconnectedCallback", this);
  }

  private getPreSetRender = () => {
    createElementFromString(`<style>${this.getStyle()}</style>`, this.rootElement);
    const button = createElementFromString(`<button class="test">Bonjour</button>`, this.rootElement);

    return () => {
      button.onclick = () => {
        this.store.state = {
          ...this.store.state,
          currentStep: ModalStep.VerifyingCode,
        };
      };
    };
  };

  public getStyle() {
    return SignInUpStyle;
  }
}
