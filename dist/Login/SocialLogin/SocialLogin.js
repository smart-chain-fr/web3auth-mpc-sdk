"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialLogin = void 0;
const tKey_1 = require("../tKey");
class SocialLogin {
    constructor() {
        this.tKey = tKey_1.tKey;
    }
    async triggerLogin() {
        if (!this.tKey) {
            console.error("tKey not initialized yet");
            return;
        }
        try {
            const loginResponse = await this.tKey.serviceProvider.triggerLogin({
                verifier: "google-tkey-w3a",
                typeOfLogin: "google",
                clientId: "774338308167-q463s7kpvja16l4l0kko3nb925ikds2p.apps.googleusercontent.com",
            });
            this.loginResponse = loginResponse;
            return loginResponse;
        }
        catch (error) {
            console.log(error);
        }
    }
    async isUserExisting() {
        const metadata = (await this.tKey.storageLayer.getMetadata({ privKey: this.loginResponse.privateKey }));
        if (metadata &&
            Object.keys(metadata).length > 0 &&
            metadata.message !== 'KEY_NOT_FOUND') {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.SocialLogin = SocialLogin;
