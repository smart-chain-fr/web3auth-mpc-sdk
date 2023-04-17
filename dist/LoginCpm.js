"use strict";
class LoginCpm extends HTMLElement {
    // connect component
    connectedCallback() {
        this.textContent = "Hello World 2!";
    }
}
customElements.define('w3c-login-view', LoginCpm);
console.log("Hello 200");
//# sourceMappingURL=LoginCpm.js.map