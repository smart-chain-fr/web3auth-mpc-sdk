export interface IInputProps {
    placeholder?: string;
    icon?: string;
    onInputChange?: ((value: string) => void) | null;
}
export default class Input extends HTMLElement {
    private render;
    private placeholder;
    private _icon;
    private _onInputChange;
    private rootElement;
    private iconElement;
    constructor();
    static get observedAttributes(): string[];
    get icon(): string;
    set icon(icon: string);
    connectedCallback(): void;
    attributeChangedCallback(name: keyof Omit<IInputProps, "onInputChange">, oldValue: string, newValue: string): void;
    disconnectedCallback(): void;
    private getPreSetRender;
    private createUpdateIconElement;
    get onInputChange(): ((value: string) => void) | null | undefined;
    set onInputChange(value: ((value: string) => void) | null | undefined);
    private applyOnInputChange;
    getStyle(): string;
}
