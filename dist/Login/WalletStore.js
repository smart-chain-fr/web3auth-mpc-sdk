"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const eccrypto_1 = require("@toruslabs/eccrypto");
const tss_client_1 = require("@toruslabs/tss-client");
const tss = __importStar(require("@toruslabs/tss-lib"));
const ethereum_provider_1 = require("@web3auth-mpc/ethereum-provider");
const keccak256_1 = __importDefault(require("keccak256"));
const calculationHelper_1 = __importDefault(require("./calculationHelper"));
const Config_1 = __importDefault(require("../Config"));
const web3_1 = __importDefault(require("web3"));
const CHAIN_NAMESPACES = {
    EIP155: "eip155",
    SOLANA: "solana",
    OTHER: "other",
};
const DELIMITERS = {
    Delimiter1: "\u001c",
    Delimiter2: "\u0015",
    Delimiter3: "\u0016",
    Delimiter4: "\u0017",
};
class WalletStore {
    static getInstance() {
        var _a;
        return (this.instance = (_a = this.instance) !== null && _a !== void 0 ? _a : new WalletStore());
    }
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
                const config = Config_1.default.getInstance().get();
                const chainConfig = {
                    chainNamespace: CHAIN_NAMESPACES.EIP155,
                    chainId: config.blockchain.ethereum.chainIdHexa,
                    rpcTarget: config.blockchain.ethereum.rpc,
                    displayName: config.blockchain.ethereum.name,
                    blockExplorer: config.blockchain.ethereum.blockExplorer,
                    ticker: config.blockchain.ethereum.ticker,
                    tickerName: config.blockchain.ethereum.tickerName,
                };
                const parties = 4;
                const clientIndex = parties - 1;
                const ec = this.getEcCrypto();
                const tssImportUrl = `https://sapphire-dev-2-2.authnetwork.dev/tss/v1/clientWasm`;
                const ethereumSigningProvider = new ethereum_provider_1.EthereumSigningProvider({
                    config: {
                        chainConfig,
                    },
                });
                const { tssNonce, tssShare2, tssShare2Index, compressedTSSPubKey, signatures, } = signingParams;
                const { verifier, verifierId } = loginReponse.userInfo;
                const vid = `${verifier}${DELIMITERS.Delimiter1}${verifierId}`;
                const sessionId = `${vid}${DELIMITERS.Delimiter2}default${DELIMITERS.Delimiter3}${tssNonce}${DELIMITERS.Delimiter4}`;
                const sign = (msgHash) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const { endpoints, tssWSEndpoints, partyIndexes } = yield this.generateTSSEndpoints(parties, clientIndex);
                    const [sockets] = yield Promise.all([
                        this.setupSockets(tssWSEndpoints),
                        tss.default(tssImportUrl),
                    ]);
                    const randomSessionNonce = (0, keccak256_1.default)((0, eccrypto_1.generatePrivate)().toString("hex") + Date.now());
                    const currentSession = `${sessionId}${randomSessionNonce.toString("hex")}`;
                    const participatingServerDKGIndexes = [1, 2, 3];
                    const dklsCoeff = calculationHelper_1.default.getDKLSCoeff(true, participatingServerDKGIndexes, tssShare2Index);
                    const denormalisedShare = dklsCoeff.mul(tssShare2).umod(ec.curve.n);
                    const share = Buffer.from(denormalisedShare.toString(16, 64), "hex").toString("base64");
                    if (!currentSession) {
                        throw new Error(`sessionAuth does not exist ${currentSession}`);
                    }
                    if (!signatures) {
                        throw new Error(`Signature does not exist ${signatures}`);
                    }
                    const client = new tss_client_1.Client(currentSession, clientIndex, partyIndexes, endpoints, sockets, share, compressedTSSPubKey.toString("base64"), true, tssImportUrl);
                    const serverCoeffs = {};
                    for (let i = 0; i < participatingServerDKGIndexes.length; i++) {
                        const serverIndex = (_a = participatingServerDKGIndexes[i]) !== null && _a !== void 0 ? _a : 0;
                        serverCoeffs[serverIndex] = calculationHelper_1.default.getDKLSCoeff(false, participatingServerDKGIndexes, tssShare2Index, serverIndex).toString("hex");
                    }
                    client.precompute(tss, { signatures, server_coeffs: serverCoeffs });
                    yield client.ready();
                    const { r, s, recoveryParam } = yield client.sign(tss, Buffer.from(msgHash).toString("base64"), true, "", "keccak256", {
                        signatures,
                    });
                    yield client.cleanup(tss, { signatures, server_coeffs: serverCoeffs });
                    return {
                        v: recoveryParam,
                        r: Buffer.from(r.toString("hex"), "hex"),
                        s: Buffer.from(s.toString("hex"), "hex"),
                    };
                });
                if (!compressedTSSPubKey) {
                    throw new Error(`compressedTSSPubKey does not exist ${compressedTSSPubKey}`);
                }
                const getPublic = () => __awaiter(this, void 0, void 0, function* () {
                    return compressedTSSPubKey;
                });
                yield ethereumSigningProvider.setupProvider({ sign, getPublic });
                const web3 = new web3_1.default(ethereumSigningProvider.provider);
                return web3;
            }
            catch (e) {
                console.error(e);
                return null;
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
