import { ModalStep } from "../../enums/Modal";
import ModalStore from "../store";

export default class SignInUp {
  private static instance: SignInUp;
  private _store = ModalStore.getInstance();
  public _style = document.createElement("style");
  public _content = document.createElement("div");

  private constructor() {
    this.setStyle();
    this.setContent();
  }

  public static getInstance(): SignInUp {
    return (this.instance = this.instance ?? new SignInUp());
  }

  private setStyle() {
    this._style.innerHTML = `
      .button {
        width: 100%;
        height: 40px;
        background-color: #000000;
        border: none;
        border-radius: 5px;
        color: #ffffff;
        font-size: 16px;
        font-weight: 600;
        margin-top: 10px;
        cursor: pointer;
      }
    `;
  }

  private setContent() {
    const button = document.createElement("button");
    button.classList.add("button");
    button.innerText = "Click me";
    button.onclick = () => {
      this._store.state = {
        ...this._store.state,
        currentStep: ModalStep.EnterBackupPassword,
      };
    };
    this._content.appendChild(button);
    this._content.appendChild(this._style);
  }
}
