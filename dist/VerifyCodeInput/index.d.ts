export interface IVerifyCodeInputProps {
    onInputChange?: ((value: string) => void) | null;
}
export default class VerifyCodeInput extends HTMLElement {
    private render;
    private rootElement;
    private onInputChange;
    private pasteContent;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private getPreSetRender;
    private pasteButtonClickHandler;
    private inputChangeHandler;
    private getStyle;
}
