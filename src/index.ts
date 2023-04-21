import EmailAddressInput from "./Components/EmailAddressInput";
import "./jsx";
import Modal from "./Components/Modal";
import SignIn from "./Components/SignIn";
import SignUp from "./Components/SignUp";
import Button from "./Components/Button";
import VerifyCode from "./Components/VerifyCode";
import VerifyCodeInput from "./Components/VerifyCodeInput";
import EnterBackupPassword from "./Components/EnterBackupPassword";

customElements.define("w3ac-modal", Modal);
customElements.define("w3ac-sign-in", SignIn);
customElements.define("w3ac-sign-up", SignUp);
customElements.define("w3ac-email-address-input", EmailAddressInput);
customElements.define("w3ac-button", Button);
customElements.define("w3ac-verify-code", VerifyCode);
customElements.define("w3ac-verify-code-input", VerifyCodeInput);
customElements.define("w3ac-enter-backup-password", EnterBackupPassword);
