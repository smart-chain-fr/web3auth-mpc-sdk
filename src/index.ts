class Login extends HTMLElement {
  // connect component
  connectedCallback() {
    this.textContent = "Hello World 2!";
  }
}

customElements.define( 'w3c-login-view', Login );
console.log("Hello 200");