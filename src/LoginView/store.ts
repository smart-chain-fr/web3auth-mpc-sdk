import EventService from "../Services/EventEmitter";

interface ILoginViewState {
  message: string;
  onClose?: () => void;
}

export class LoginViewStore {
  private readonly event = new EventService();

  private _state: ILoginViewState = {
    message: "Hello World",
  };

  public set state(newState: ILoginViewState) {
    this._state = newState;
    this.event.emit("change");
  }

  public get state(): ILoginViewState {
    return this._state;
  }

  onChange(callback: () => void) {
    this.event.on("change", callback);
    return () => {
      this.event.off("change", callback);
    };
  }
}
