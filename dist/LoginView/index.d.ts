export interface ILoginViewProps {
    onClose?: (() => void) | null;
}
export default class LoginView extends HTMLElement {
    protected rootElement: ShadowRoot;
    private _style;
    private store;
    private _onClose;
    private removeStore;
    constructor();
    connectedCallback(): void;
    static get observedAttributes(): never[];
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    disconnectedCallback(): void;
    get onClose(): ILoginViewProps["onClose"];
    set onClose(onClose: ILoginViewProps["onClose"]);
    private render;
    private setStyle;
    private onClick;
}
