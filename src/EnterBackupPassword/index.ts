import { createElementFromString } from "../utils/domUtils";
import { EnterBackupPasswordStyle } from "./style";

export default class EnterBackupPassword extends HTMLElement {
  private render: (() => void) | null = null;
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
    return () => {};
  }

  private getStyle() {
    return EnterBackupPasswordStyle;
  }
}
