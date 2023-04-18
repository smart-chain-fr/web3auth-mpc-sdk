export interface IModalProps {
    title: string;
    onClose?: (() => void) | null;
}
export default class Modal extends HTMLElement {
    protected rootElement: ShadowRoot;
    private _style;
    private _onClose;
    private _popupTitle;
    constructor();
    static get observedAttributes(): string[];
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private render;
    private setStyle;
    private setFontFamily;
    get onClose(): IModalProps["onClose"];
    set onClose(onClose: IModalProps["onClose"]);
    get popupTitle(): string;
}
