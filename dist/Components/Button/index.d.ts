export declare enum ButtonVariant {
    Primary = "primary",
    Secondary = "secondary"
}
export interface IButtonProps {
    onClick?: (() => void) | null;
    text: string;
    variant: ButtonVariant;
}
export default class Button extends HTMLElement {
    private render;
    private onClick;
    private rootElement;
    private text;
    private variant;
    constructor();
    static get observedAttributes(): string[];
    connectedCallback(): void;
    attributeChangedCallback(name: keyof IButtonProps, oldValue: string, newValue: string): void;
    disconnectedCallback(): void;
    private getPreSetRender;
    private onClickHandler;
    private getStyle;
}
