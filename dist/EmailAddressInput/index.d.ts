export interface IInputProps {
    onInputChange?: ((value: string) => void) | null;
}
export default class EmailAddressInput extends HTMLElement {
    private render;
    private placeholder;
    private onInputChange;
    private rootElement;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private getPreSetRender;
    private inputChangeHandler;
    getStyle(): string;
}
