"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MyStore {
    constructor() {
        this.state = {
            hello: "Bonjour X"
        };
    }
    onChange(callback) {
        return () => { };
    }
}
class LoginView extends HTMLElement {
    constructor() {
        super();
        this._style = `<style></style>`;
        this.store = new MyStore();
        this.removeStore = () => { };
        this.rootElement = this.attachShadow({ mode: "closed" });
    }
    connectedCallback() {
        this.removeStore = this.store.onChange(() => this.render());
        this.render();
    }
    disconnectedCallback() {
        this.removeStore();
    }
    render() {
        this.rootElement.innerHTML = `${this._style}
		  <div class="popup" onclick="alert('bravo')">
			  <div class="popup-content">${this.store.state.hello}</div>
		  </div>
	  `;
    }
}
exports.default = LoginView;
