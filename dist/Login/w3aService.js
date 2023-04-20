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
const ethersRPC_1 = __importDefault(require("./ethersRPC"));
const web3auth_1 = require("@web3auth-mpc/web3auth");
const openlogin_adapter_1 = require("@web3auth-mpc/openlogin-adapter");
const torus_mpc_1 = require("torus-mpc");
const clientId = "BHMup7Fr9298T8YP9MZ61bjOHuO_ZYBPSkOfGyialHDWHlEkOuDpHKJ0liGOuNsLLAv_TH45NmxULNMohJrd8Xk";
class w3aService {
    constructor() {
        this.web3auth = null;
        this.provider = null;
    }
    initEthAuth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const web3auth = new web3auth_1.Web3Auth({
                    clientId,
                    uiConfig: {
                        appLogo: "https://images.web3auth.io/web3auth-logo-w.svg",
                        theme: "light",
                        loginMethodsOrder: ["twitter", "google"],
                    },
                    chainConfig: {
                        chainNamespace: "eip155",
                        chainId: "0x5",
                        rpcTarget: "https://rpc.ankr.com/eth_goerli",
                        displayName: "Goerli Testnet",
                        blockExplorer: "https://goerli.etherscan.io/",
                        ticker: "ETH",
                        tickerName: "Ethereum",
                    },
                    enableLogging: true,
                });
                const openloginAdapter = new openlogin_adapter_1.OpenloginAdapter({
                    loginSettings: {
                        mfaLevel: "mandatory",
                    },
                    tssSettings: {
                        useTSS: true,
                        tssGetPublic: torus_mpc_1.tssGetPublic,
                        tssSign: torus_mpc_1.tssSign,
                        tssDataCallback: torus_mpc_1.tssDataCallback,
                    },
                    adapterSettings: {
                        _iframeUrl: "https://mpc-beta.openlogin.com",
                        network: "development",
                        clientId,
                    },
                });
                web3auth.configureAdapter(openloginAdapter);
                yield web3auth.initModal({
                    modalConfig: {
                        "torus-evm": {
                            label: "Torus Wallet",
                            showOnModal: false,
                        },
                        metamask: {
                            label: "Metamask",
                            showOnModal: false,
                        },
                        "wallet-connect-v1": {
                            label: "Wallet Connect",
                            showOnModal: false,
                        },
                    },
                });
                this.web3auth = web3auth;
                if (web3auth.provider) {
                    this.provider = web3auth.provider;
                }
            }
            catch (error) {
                console.log("error", error);
            }
        });
    }
    ;
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.web3auth) {
                console.log("web3auth not initialized yet");
                return;
            }
            const web3authProvider = yield this.web3auth.connect();
            this.provider = web3authProvider;
            (0, torus_mpc_1.generatePrecompute)();
        });
    }
    ;
    getUserInfo() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.web3auth) {
                console.log("web3auth not initialized yet");
                return;
            }
            const user = yield ((_a = this.web3auth) === null || _a === void 0 ? void 0 : _a.getUserInfo());
            console.log(user);
        });
    }
    ;
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.web3auth) {
                console.log("web3auth not initialized yet");
                return;
            }
            yield this.web3auth.logout();
            this.provider = null;
        });
    }
    ;
    getChainId() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider) {
                console.log("provider not initialized yet");
                return;
            }
            const rpc = new ethersRPC_1.default(this.provider);
            const chainId = yield rpc.getChainId();
            console.log(chainId);
        });
    }
    ;
    getAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider) {
                console.log("provider not initialized yet");
                return;
            }
            const rpc = new ethersRPC_1.default(this.provider);
            const address = yield rpc.getAccounts();
            console.log("ETH Address: " + address);
        });
    }
    ;
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider) {
                console.log("provider not initialized yet");
                return;
            }
            const rpc = new ethersRPC_1.default(this.provider);
            const balance = yield rpc.getBalance();
            console.log(balance);
        });
    }
    ;
    signTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider) {
                console.log("provider not initialized yet");
                return;
            }
            const rpc = new ethersRPC_1.default(this.provider);
            const receipt = yield rpc.signMessage();
            console.log(receipt);
        });
    }
    ;
    sendTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider) {
                console.log("provider not initialized yet");
                return;
            }
            const rpc = new ethersRPC_1.default(this.provider);
            const receipt = yield rpc.sendTransaction();
            console.log(receipt);
        });
    }
    ;
    signMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider) {
                console.log("provider not initialized yet");
                return;
            }
            const rpc = new ethersRPC_1.default(this.provider);
            const signedMessage = yield rpc.signMessage();
            console.log(signedMessage);
        });
    }
    ;
}
exports.default = w3aService;
