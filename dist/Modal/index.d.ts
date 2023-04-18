import ModalStore from "./store";
export interface IModalProps {
    onCloseButtonClick?: (() => void) | null;
}
export default class Modal extends HTMLElement {
    private render;
    private removeOnStateChange;
    private _onCloseButtonClick;
    protected rootElement: ShadowRoot;
    protected store: ModalStore;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private getPreSetRender;
    get onCloseButtonClick(): IModalProps["onCloseButtonClick"];
    set onCloseButtonClick(onCloseButtonClick: IModalProps["onCloseButtonClick"]);
    private applyOnCloseButtonClick;
    private setFontFamily;
    getStyle(): string;
}
