class MyStore {
  state = {
    hello: "Bonjour X"
  };
  onChange(callback: () => void) {
    return () => {};
  }
}

export default class LoginView extends HTMLElement {
  protected rootElement: ShadowRoot;
  private readonly _style = `<style></style>`;
  private store = new MyStore();
  private removeStore = () => {};
  constructor() {
    super();
    this.rootElement = this.attachShadow({ mode: "closed" });
  }

  // connect component
  public connectedCallback(): void {
    this.removeStore = this.store.onChange(() => this.render());
    this.render();
  }

  public disconnectedCallback(): void {
    this.removeStore();
  }

  private render() {
    this.rootElement.innerHTML = `${this._style}
		  <div class="popup" onclick="alert('bravo')">
			  <div class="popup-content">${this.store.state.hello}</div>
		  </div>
	  `;
  }
}
