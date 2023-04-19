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
const elliptic_1 = __importDefault(require("elliptic"));
const socket_io_client_1 = require("socket.io-client");
class WalletStore {
    generateTSSEndpoints(parties, clientIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoints = [];
            const tssWSEndpoints = [];
            const partyIndexes = [];
            for (let i = 0; i < parties; i++) {
                partyIndexes.push(i);
                if (i === clientIndex) {
                    endpoints.push(null);
                    tssWSEndpoints.push(null);
                }
                else {
                    endpoints.push(`https://sapphire-dev-2-${i + 1}.authnetwork.dev/tss`);
                    tssWSEndpoints.push(`https://sapphire-dev-2-${i + 1}.authnetwork.dev`);
                }
            }
            return { endpoints, tssWSEndpoints, partyIndexes };
        });
    }
    getEcCrypto() {
        return new elliptic_1.default.ec("secp256k1");
    }
    initWallet(loginReponse, signingParams) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chainConfig = {
                    chainId: "0x5",
                    rpcTarget: "https://rpc.ankr.com/eth_goerli",
                    displayName: "Goerli Testnet",
                    blockExplorer: "https://goerli.etherscan.io",
                    ticker: "ETH",
                    tickerName: "Ethereum",
                };
                console.log("chainConfig", chainConfig);
                const param = { chainConfig };
                console.log(param);
                const { compressedTSSPubKey, } = signingParams;
                if (!compressedTSSPubKey) {
                    throw new Error(`compressedTSSPubKey does not exist ${compressedTSSPubKey}`);
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    setupSockets(tssWSEndpoints) {
        return __awaiter(this, void 0, void 0, function* () {
            const sockets = yield this.createSockets(tssWSEndpoints);
            yield new Promise((resolve) => {
                const checkConnectionTimer = setInterval(() => {
                    for (let i = 0; i < sockets.length; i++) {
                        if (sockets[i] && sockets[i] !== null && !sockets[i].connected)
                            return;
                    }
                    clearInterval(checkConnectionTimer);
                    resolve(true);
                }, 100);
            });
            return sockets;
        });
    }
    createSockets(wsEndpoints) {
        return __awaiter(this, void 0, void 0, function* () {
            return wsEndpoints.map((wsEndpoint) => {
                if (wsEndpoint === null || wsEndpoint === undefined) {
                    return null;
                }
                return (0, socket_io_client_1.io)(wsEndpoint, {
                    path: "/tss/socket.io",
                    transports: ["websocket", "polling"],
                    withCredentials: true,
                    reconnectionDelayMax: 10000,
                    reconnectionAttempts: 10,
                });
            });
        });
    }
}
exports.default = WalletStore;
