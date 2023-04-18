import ModalStore from "./store";
export interface IModalProps {
    onCloseButtonClick?: (() => void) | null;
}
export default class Modal extends HTMLElement {
    private _onCloseButtonClick;
    private _style;
    private _removeOnStateChange;
    protected _rootElement: ShadowRoot;
    protected _children: HTMLDivElement;
    protected _store: ModalStore;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private render;
    private setChildren;
    get onCloseButtonClick(): IModalProps["onCloseButtonClick"];
    set onCloseButtonClick(onCloseButtonClick: IModalProps["onCloseButtonClick"]);
    private setFontFamily;
    private setStyle;
}
