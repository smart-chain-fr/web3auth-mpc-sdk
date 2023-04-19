import ModalStore from "../Modal/store";
export interface ITemplateConstructor {
    style: string;
}
export declare abstract class Template extends HTMLElement {
    private render;
    private _style;
    protected rootElement: ShadowRoot;
    protected modalStore: ModalStore;
    constructor({ style }: ITemplateConstructor);
    connectedCallback(): void;
    disconnectedCallback(): void;
    private getPreSetRender;
    getStyle(): string;
}
