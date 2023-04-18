import EventService from "../Services/EventEmitter";
import { ModalStep } from "../enums/Modal";

interface IModalState {
  currentStep: ModalStep;
}

export default class ModalStore {
  private static instance: ModalStore;
  private readonly event = new EventService();

  private constructor() {}

  public static getInstance(): ModalStore {
    return (this.instance = this.instance ?? new ModalStore());
  }

  private _state: IModalState = {
    currentStep: ModalStep.SignIn,
  };

  public set state(newState: IModalState) {
    this._state = newState;
    this.event.emit("change");
  }

  public get state(): IModalState {
    return this._state;
  }

  public onChange(callback: () => void) {
    this.event.on("change", callback);
    return () => {
      this.event.off("change", callback);
    };
  }
}
