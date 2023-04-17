class Login extends HTMLElement {
  shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "closed" });
  }

  // connect component
  connectedCallback() {
    this.shadow.innerHTML = `
        <style></style>
        <div class="popup">
            <div class="popup-content">Bonjour</div>
        </div>
    `;
  }
}

customElements.define("w3ac-login-view", Login);
