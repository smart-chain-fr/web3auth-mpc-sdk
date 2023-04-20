import EmailAddressInput from "./EmailAddressInput";
import "./jsx";
import Modal from "./Modal";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Button from "./Button";
import VerifyCode from "./VerifyCode";

customElements.define("w3ac-modal", Modal);
customElements.define("w3ac-sign-in", SignIn);
customElements.define("w3ac-sign-up", SignUp);
customElements.define("w3ac-email-address-input", EmailAddressInput);
customElements.define("w3ac-button", Button);
customElements.define("w3ac-verify-code", VerifyCode);
