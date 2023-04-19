import ModalStore from "../Modal/store";
import { ModalStep } from "../enums/Modal";
import createElementFromString from "../utils";
import { SignInUpStyle } from "./style";

export default class SignIn extends HTMLElement {
  private render = () => {};
  protected rootElement: ShadowRoot = this.attachShadow({ mode: "closed" });
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
    const subtitleElement = createElementFromString(`<p class="subtitle">Don't have an account?</p>`, this.rootElement);
    const switchCurrentStepElement = createElementFromString(
      `<span class="switch">Create account</span>`,
      subtitleElement
    );

    return () => {
      switchCurrentStepElement.onclick = () => {
        this.store.state = {
          ...this.store.state,
          currentStep: ModalStep.SignUp,
        };
        this.rootElement.innerHTML = "";
      };
    };
  };

  public getStyle() {
    return SignInUpStyle;
  }
}
