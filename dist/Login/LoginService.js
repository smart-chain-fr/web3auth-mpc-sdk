"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginService = void 0;
const common_types_1 = require("@tkey/common-types");
const bn_js_1 = __importDefault(require("bn.js"));
const eccrypto_1 = require("eccrypto");
const calculationHelper_1 = __importDefault(require("./calculationHelper"));
const tKey_1 = require("./tKey");
const utils_1 = require("./utils");
class LoginService {
    constructor() {
        this.tssShare2 = new bn_js_1.default(0);
        this.tssShare2Index = 0;
    }
    static getInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.instance)
                return this.instance;
            this.instance = new LoginService();
            yield this.instance.init();
            return this.instance;
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield tKey_1.tKey.serviceProvider.init();
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    triggerLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tKey_1.tKey) {
                console.error("tKey not initialized yet");
                return null;
            }
            try {
                const loginResponse = yield tKey_1.tKey.serviceProvider.triggerLogin({
                    verifier: "google-tkey-w3a",
                    typeOfLogin: "google",
                    clientId: "774338308167-q463s7kpvja16l4l0kko3nb925ikds2p.apps.googleusercontent.com",
                });
                console.log("loginResponse", loginResponse);
                this.loginResponse = loginResponse;
                const factorKey = yield this.getFactorKey();
                const compressedTSSPubKey = yield this.initTSSfromFactorKey(factorKey);
                const signingParams = this.getSigningParams(compressedTSSPubKey);
                return { loginResponse, signingParams };
            }
            catch (error) {
                console.log(error);
                return null;
            }
        });
    }
    isUserExisting() {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = yield tKey_1.tKey.storageLayer.getMetadata({
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
        });
    }
    getFactorKey() {
        return __awaiter(this, void 0, void 0, function* () {
            let factorKey = null;
            if (yield this.isUserExisting()) {
                if (this.isLocalSharePresent()) {
                    console.log("Local share present");
                    factorKey = this.getFactorKeyFromLocalStore();
                    console.log(factorKey);
                }
                else {
                    const backupShare = "coucou";
                    try {
                        factorKey = yield this.deserializeBackupShare(backupShare);
                    }
                    catch (error) {
                        console.log(error);
                        throw new Error("Invalid backup share");
                    }
                }
                yield this.reconstructKey(factorKey);
                return factorKey;
            }
            return yield this.createFactorKey();
        });
    }
    createFactorKey() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Creating factor key");
            const factorKey = new bn_js_1.default((0, eccrypto_1.generatePrivate)());
            const deviceTSSShare = new bn_js_1.default((0, eccrypto_1.generatePrivate)());
            const deviceTSSIndex = 2;
            const factorPub = (0, common_types_1.getPubKeyPoint)(factorKey);
            yield tKey_1.tKey.initialize({
                useTSS: true,
                factorPub,
                deviceTSSShare,
                deviceTSSIndex,
            });
            return factorKey;
        });
    }
    isLocalSharePresent() {
        const tKeyLocalStoreString = localStorage.getItem(`tKeyLocalStore\u001c${this.loginResponse.userInfo.verifier}\u001c${this.loginResponse.userInfo.verifierId}`);
        const tKeyLocalStore = JSON.parse(tKeyLocalStoreString || "{}");
        return (tKeyLocalStore.verifier === this.loginResponse.userInfo.verifier &&
            tKeyLocalStore.verifierId === this.loginResponse.userInfo.verifierId);
    }
    deserializeBackupShare(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const factorKey = yield tKey_1.tKey.modules["shareSerialization"].deserialize(value, "mnemonic");
            return factorKey;
        });
    }
    getFactorKeyFromLocalStore() {
        const tKeyLocalStoreString = localStorage.getItem(`tKeyLocalStore\u001c${this.loginResponse.userInfo.verifier}\u001c${this.loginResponse.userInfo.verifierId}`);
        const tKeyLocalStore = JSON.parse(tKeyLocalStoreString || "{}");
        return new bn_js_1.default(tKeyLocalStore.factorKey, "hex");
    }
    setFactorKeyInLocalStore(factorKey) {
        localStorage.setItem(`tKeyLocalStore\u001c${this.loginResponse.userInfo.verifier}\u001c${this.loginResponse.userInfo.verifierId}`, JSON.stringify({
            factorKey: factorKey.toString("hex"),
            verifier: this.loginResponse.userInfo.verifier,
            verifierId: this.loginResponse.userInfo.verifierId,
        }));
    }
    isMissingShares() {
        const { requiredShares } = tKey_1.tKey.getKeyDetails();
        return requiredShares > 0;
    }
    reconstructKey(factorKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const factorKeyMetadata = yield tKey_1.tKey.storageLayer.getMetadata({
                privKey: factorKey,
            });
            if (factorKeyMetadata.message === "KEY_NOT_FOUND") {
                throw new Error("no metadata for your factor key, reset your account");
            }
            const metadataShare = JSON.parse(factorKeyMetadata.message);
            if (!metadataShare.deviceShare || !metadataShare.tssShare)
                throw new Error("Invalid data from metadata");
            const metadataDeviceShare = metadataShare.deviceShare;
            yield tKey_1.tKey.initialize({ neverInitializeNewKey: true });
            yield tKey_1.tKey.inputShareStoreSafe(metadataDeviceShare, true);
            yield tKey_1.tKey.reconstructKey();
        });
    }
    getTSShare1() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const tssNonce = (_a = tKey_1.tKey.metadata.tssNonces[tKey_1.tKey.tssTag]) !== null && _a !== void 0 ? _a : 0;
            const tssShare1PubKeyDetails = yield tKey_1.tKey.serviceProvider.getTSSPubKey(tKey_1.tKey.tssTag, tssNonce);
            const tssShare1PubKey = new common_types_1.Point(tssShare1PubKeyDetails.x.toString("hex"), tssShare1PubKeyDetails.y.toString("hex"));
            return tssShare1PubKey;
        });
    }
    calcultateCompressedPubKeyFromTSS(tssShare1PubKey, tssShare2, tssShare2Index) {
        console.log("args", tssShare1PubKey, tssShare2, tssShare2Index);
        const tssPubKey = calculationHelper_1.default.getTSSPubKey(tssShare1PubKey, tssShare2, tssShare2Index);
        console.log("tssPubKey", tssPubKey);
        const compressedTSSPubKey = Buffer.from(`${tssPubKey.getX().toString(16, 64)}${tssPubKey
            .getY()
            .toString(16, 64)}`, "hex");
        return compressedTSSPubKey;
    }
    getDeviceShareFromTkey() {
        return __awaiter(this, void 0, void 0, function* () {
            const polyId = tKey_1.tKey.metadata.getLatestPublicPolynomial().getPolynomialID();
            const shares = tKey_1.tKey.shares[polyId];
            let deviceShare;
            for (const shareIndex in shares) {
                if (shareIndex !== "1") {
                    deviceShare = shares[shareIndex];
                }
            }
            return deviceShare;
        });
    }
    addFactorKeyMetadata(factorKey, tssShare, tssIndex, factorKeyDescription) {
        return __awaiter(this, void 0, void 0, function* () {
            const { requiredShares } = tKey_1.tKey.getKeyDetails();
            if (requiredShares > 0) {
                console.error("not enough shares for metadata key");
            }
            const metadataDeviceShare = yield this.getDeviceShareFromTkey();
            const factorIndex = (0, common_types_1.getPubKeyECC)(factorKey).toString("hex");
            const metadataToSet = {
                deviceShare: metadataDeviceShare,
                tssShare,
                tssIndex,
            };
            yield tKey_1.tKey.addLocalMetadataTransitions({
                input: [{ message: JSON.stringify(metadataToSet) }],
                privKey: [factorKey],
            });
            const params = {
                module: factorKeyDescription,
                dateAdded: Date.now(),
                tssShareIndex: tssIndex,
            };
            yield tKey_1.tKey.addShareDescription(factorIndex, JSON.stringify(params), true);
        });
    }
    initTSSfromFactorKey(factorKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isMissingShares()) {
                const { requiredShares } = tKey_1.tKey.getKeyDetails();
                throw `Threshold not met. Required Share: ${requiredShares}. You should reset your account.`;
            }
            const tssShare1PubKey = yield this.getTSShare1();
            const { tssShare: tssShare2, tssIndex: tssShare2Index } = yield tKey_1.tKey.getTSSShare(factorKey);
            this.tssShare2 = tssShare2;
            this.tssShare2Index = tssShare2Index;
            const compressedTSSPubKey = this.calcultateCompressedPubKeyFromTSS(tssShare1PubKey, tssShare2, tssShare2Index);
            if (!this.isLocalSharePresent()) {
                yield this.addFactorKeyMetadata(factorKey, tssShare2, tssShare2Index, "local storage share");
            }
            yield tKey_1.tKey.syncLocalMetadataTransitions();
            this.setFactorKeyInLocalStore(factorKey);
            return compressedTSSPubKey;
        });
    }
    getSigningParams(compressedTSSPubKey) {
        var _a, _b;
        const to_ret = {
            tssNonce: (_b = (_a = tKey_1.tKey.metadata.tssNonces) === null || _a === void 0 ? void 0 : _a[tKey_1.tKey.tssTag]) !== null && _b !== void 0 ? _b : 0,
            tssShare2: this.tssShare2,
            tssShare2Index: this.tssShare2Index,
            compressedTSSPubKey,
            signatures: this.loginResponse.signatures.filter((sign) => sign !== null),
        };
        return to_ret;
    }
    getUser() {
        return this.loginResponse.userInfo;
    }
    getProvider(chainConfig, loginReponse, signingParams) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, utils_1.setupWeb3)(chainConfig, loginReponse, signingParams);
        });
    }
}
exports.LoginService = LoginService;
