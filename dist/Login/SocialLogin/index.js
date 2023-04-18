"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const eccrypto_1 = require("eccrypto");
const common_types_1 = require("@tkey/common-types");
const tKey_1 = require("../tKey");
class Login {
    async triggerLogin() {
        if (!tKey_1.tKey) {
            console.error("tKey not initialized yet");
            return;
        }
        try {
            const loginResponse = await tKey_1.tKey.serviceProvider.triggerLogin({
                verifier: "google-tkey-w3a",
                typeOfLogin: "google",
                clientId: "774338308167-q463s7kpvja16l4l0kko3nb925ikds2p.apps.googleusercontent.com",
            });
            console.log("loginResponse", loginResponse);
            this.loginResponse = loginResponse;
            return loginResponse;
        }
        catch (error) {
            console.log(error);
        }
    }
    async isUserExisting() {
        const metadata = await tKey_1.tKey.storageLayer.getMetadata({
            privKey: this.loginResponse.privateKey,
        });
        if (metadata &&
            Object.keys(metadata).length > 0 &&
            metadata.message !== "KEY_NOT_FOUND") {
            return true;
        }
        else {
            return false;
        }
    }
    async createUser() {
        const factorKey = new bn_js_1.default((0, eccrypto_1.generatePrivate)());
        const deviceTSSShare = new bn_js_1.default((0, eccrypto_1.generatePrivate)());
        const deviceTSSIndex = 2;
        const factorPub = (0, common_types_1.getPubKeyPoint)(factorKey);
        await tKey_1.tKey.initialize({
            useTSS: true,
            factorPub,
            deviceTSSShare,
            deviceTSSIndex,
        });
    }
    isLocalSharePresent() {
        const tKeyLocalStoreString = localStorage.getItem(`tKeyLocalStore\u001c${this.loginResponse.userInfo.verifier}\u001c${this.loginResponse.userInfo.verifierId}`);
        const tKeyLocalStore = JSON.parse(tKeyLocalStoreString || "{}");
        return (tKeyLocalStore.verifier === this.loginResponse.userInfo.verifier &&
            tKeyLocalStore.verifierId === this.loginResponse.userInfo.verifierId);
    }
    async checkBackupShare(value) {
        const factorKey = await tKey_1.tKey.modules["shareSerialization"].deserialize(value, "mnemonic");
        return factorKey !== null;
    }
    getFactorKeyFromLocalStore() {
        const tKeyLocalStoreString = localStorage.getItem(`tKeyLocalStore\u001c${this.loginResponse.userInfo.verifier}\u001c${this.loginResponse.userInfo.verifierId}`);
        const tKeyLocalStore = JSON.parse(tKeyLocalStoreString || "{}");
        return new bn_js_1.default(tKeyLocalStore.factorKey, "hex");
    }
    async reconstructKey(factorKey) {
        const factorKeyMetadata = await tKey_1.tKey.storageLayer.getMetadata({
            privKey: factorKey,
        });
        if (factorKeyMetadata.message === "KEY_NOT_FOUND") {
            throw new Error("no metadata for your factor key, reset your account");
        }
        const metadataShare = JSON.parse(factorKeyMetadata.message);
        if (!metadataShare.deviceShare || !metadataShare.tssShare)
            throw new Error("Invalid data from metadata");
        const metadataDeviceShare = metadataShare.deviceShare;
        await tKey_1.tKey.initialize({ neverInitializeNewKey: true });
        await tKey_1.tKey.inputShareStoreSafe(metadataDeviceShare, true);
        await tKey_1.tKey.reconstructKey();
    }
}
exports.Login = Login;
