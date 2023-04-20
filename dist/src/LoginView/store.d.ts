interface ILoginViewState {
    message: string;
}
export declare class LoginViewStore {
    private readonly event;
    private _state;
    set state(newState: ILoginViewState);
    get state(): ILoginViewState;
    onChange(callback: () => void): () => void;
}
export {};
