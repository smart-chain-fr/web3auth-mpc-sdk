export interface IModalProps {
    onCloseButtonClick?: (() => void) | null;
}
export default class Modal extends HTMLElement {
    private render;
    private removeOnStateChange;
    private rootElement;
    private store;
    onCloseButtonClick: IModalProps["onCloseButtonClick"];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private getPreSetRender;
    private closeButtonClick;
    private setFontFamily;
    private getStyle;
}
