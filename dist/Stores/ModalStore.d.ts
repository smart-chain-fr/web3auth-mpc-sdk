import { ModalStep } from "../enums/Modal";
interface IModalState {
    currentStep: ModalStep;
    userEmail: string;
    pinCode: string;
}
export default class ModalStore {
    private static instance;
    private readonly event;
    private constructor();
    static getInstance(): ModalStore;
    private _state;
    set state(newState: IModalState);
    get state(): IModalState;
    onChange(callback: () => void): () => void;
}
export {};
