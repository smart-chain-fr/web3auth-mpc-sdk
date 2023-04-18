export interface IModalProps {
    title: string;
    onCloseButtonClick?: (() => void) | null;
}
export default class Modal extends HTMLElement {
    protected rootElement: ShadowRoot;
    private _style;
    private _children;
    private _onCloseButtonClick;
    private _popupTitle;
    constructor();
    static get observedAttributes(): string[];
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private render;
    get onCloseButtonClick(): IModalProps["onCloseButtonClick"];
    set onCloseButtonClick(onCloseButtonClick: IModalProps["onCloseButtonClick"]);
    get popupTitle(): string;
    private updateProperty;
    private initChildrenDiv;
    private setFontFamily;
    private setStyle;
}
