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
exports.addNewTSSShareAndFactor = exports.copyExistingTSSShareForNewFactor = exports.addFactorKeyMetadata = exports.setupWeb3 = exports.generateTSSEndpoints = exports.setupSockets = exports.getTSSPubKey = exports.assignTssKey = exports.fetchPostboxKeyAndSigs = exports.generateIdToken = exports.createSockets = exports.getLagrangeCoeffs = exports.getDKLSCoeff = exports.getDenormaliseCoeff = exports.getAdditiveCoeff = exports.ecPoint = exports.getEcCrypto = void 0;
const common_types_1 = require("@tkey/common-types");
const eccrypto_1 = require("@toruslabs/eccrypto");
const torus_js_1 = __importDefault(require("@toruslabs/torus.js"));
const tss_client_1 = require("@toruslabs/tss-client");
const tss = __importStar(require("@toruslabs/tss-lib"));
const ethereum_provider_1 = require("@web3auth-mpc/ethereum-provider");
const bn_js_1 = __importDefault(require("bn.js"));
const elliptic_1 = __importDefault(require("elliptic"));
const jsrsasign_1 = __importDefault(require("jsrsasign"));
const keccak256_1 = __importDefault(require("keccak256"));
const socket_io_client_1 = require("socket.io-client");
const torusNodeEndpoints = [
    "https://sapphire-dev-2-1.authnetwork.dev/sss/jrpc",
    "https://sapphire-dev-2-2.authnetwork.dev/sss/jrpc",
    "https://sapphire-dev-2-3.authnetwork.dev/sss/jrpc",
    "https://sapphire-dev-2-4.authnetwork.dev/sss/jrpc",
    "https://sapphire-dev-2-5.authnetwork.dev/sss/jrpc",
];
const torus = new torus_js_1.default({
    metadataHost: "https://sapphire-dev-2-1.authnetwork.dev/metadata",
    network: "cyan",
    enableOneKey: true,
});
const DELIMITERS = {
    Delimiter1: "\u001c",
    Delimiter2: "\u0015",
    Delimiter3: "\u0016",
    Delimiter4: "\u0017",
};
function getEcCrypto() {
    return new elliptic_1.default.ec("secp256k1");
}
exports.getEcCrypto = getEcCrypto;
function ecPoint(p) {
    const ec = getEcCrypto();
    return ec
        .keyFromPublic({ x: p.x.padStart(64, "0"), y: p.y.padStart(64, "0") })
        .getPublic();
}
exports.ecPoint = ecPoint;
const getAdditiveCoeff = (isUser, participatingServerIndexes, userTSSIndex, serverIndex) => {
    const ec = getEcCrypto();
    if (isUser) {
        return getLagrangeCoeffs([1, userTSSIndex], userTSSIndex);
    }
    const serverLagrangeCoeff = getLagrangeCoeffs(participatingServerIndexes, serverIndex);
    const masterLagrangeCoeff = getLagrangeCoeffs([1, userTSSIndex], 1);
    const additiveLagrangeCoeff = serverLagrangeCoeff
        .mul(masterLagrangeCoeff)
        .umod(ec.curve.n);
    return additiveLagrangeCoeff;
};
exports.getAdditiveCoeff = getAdditiveCoeff;
const getDenormaliseCoeff = (party, parties) => {
    if (parties.indexOf(party) === -1)
        throw new Error(`party ${party} not found in parties ${parties}`);
    const ec = getEcCrypto();
    const denormaliseLagrangeCoeff = getLagrangeCoeffs(parties, party)
        .invm(ec.curve.n)
        .umod(ec.curve.n);
    return denormaliseLagrangeCoeff;
};
exports.getDenormaliseCoeff = getDenormaliseCoeff;
const getDKLSCoeff = (isUser, participatingServerIndexes, userTSSIndex, serverIndex) => {
    const sortedServerIndexes = participatingServerIndexes.sort((a, b) => a - b);
    for (let i = 0; i < sortedServerIndexes.length; i++) {
        if (sortedServerIndexes[i] !== participatingServerIndexes[i])
            throw new Error("server indexes must be sorted");
    }
    const parties = [];
    let serverPartyIndex = 0;
    for (let i = 0; i < participatingServerIndexes.length; i++) {
        const currentPartyIndex = i + 1;
        parties.push(currentPartyIndex);
        if (participatingServerIndexes[i] === serverIndex)
            serverPartyIndex = currentPartyIndex;
    }
    const userPartyIndex = parties.length + 1;
    parties.push(userPartyIndex);
    if (isUser) {
        const additiveCoeff = (0, exports.getAdditiveCoeff)(isUser, participatingServerIndexes, userTSSIndex, serverIndex);
        const denormaliseCoeff = (0, exports.getDenormaliseCoeff)(userPartyIndex, parties);
        const ec = getEcCrypto();
        return denormaliseCoeff.mul(additiveCoeff).umod(ec.curve.n);
    }
    const additiveCoeff = (0, exports.getAdditiveCoeff)(isUser, participatingServerIndexes, userTSSIndex, serverIndex);
    const denormaliseCoeff = (0, exports.getDenormaliseCoeff)(serverPartyIndex, parties);
    const ec = getEcCrypto();
    const coeff = denormaliseCoeff.mul(additiveCoeff).umod(ec.curve.n);
    return coeff;
};
exports.getDKLSCoeff = getDKLSCoeff;
function getLagrangeCoeffs(_allIndexes, _myIndex, _target = 0) {
    const ec = getEcCrypto();
    const allIndexes = _allIndexes.map((i) => new bn_js_1.default(i));
    const myIndex = new bn_js_1.default(_myIndex);
    const target = new bn_js_1.default(_target);
    let upper = new bn_js_1.default(1);
    let lower = new bn_js_1.default(1);
    for (let j = 0; j < allIndexes.length; j += 1) {
        if (myIndex.cmp(allIndexes[j]) !== 0) {
            let tempUpper = target.sub(allIndexes[j]);
            tempUpper = tempUpper.umod(ec.curve.n);
            upper = upper.mul(tempUpper);
            upper = upper.umod(ec.curve.n);
            let tempLower = myIndex.sub(allIndexes[j]);
            tempLower = tempLower.umod(ec.curve.n);
            lower = lower.mul(tempLower).umod(ec.curve.n);
        }
    }
    return upper.mul(lower.invm(ec.curve.n)).umod(ec.curve.n);
}
exports.getLagrangeCoeffs = getLagrangeCoeffs;
const createSockets = (wsEndpoints) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.createSockets = createSockets;
const jwtPrivateKey = `-----BEGIN PRIVATE KEY-----\nMEECAQAwEwYHKoZIzj0CAQYIKoZIzj0DAQcEJzAlAgEBBCCD7oLrcKae+jVZPGx52Cb/lKhdKxpXjl9eGNa1MlY57A==\n-----END PRIVATE KEY-----`;
const generateIdToken = (email) => {
    const alg = "ES256";
    const iat = Math.floor(Date.now() / 1000);
    const payload = {
        iss: "torus-key-test",
        aud: "torus-key-test",
        name: email,
        email,
        scope: "email",
        iat,
        eat: iat + 120,
    };
    const options = {
        expiresIn: 120,
        algorithm: alg,
    };
    const header = { alg, typ: "JWT" };
    const token = jsrsasign_1.default.jws.JWS.sign(alg, header, payload, jwtPrivateKey, options);
    return token;
};
exports.generateIdToken = generateIdToken;
function fetchPostboxKeyAndSigs(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { verifierName, verifierId } = opts;
        const token = (0, exports.generateIdToken)(verifierId);
        const retrieveSharesResponse = yield torus.retrieveShares(torusNodeEndpoints, verifierName, { verifier_id: verifierId }, token);
        const signatures = [];
        retrieveSharesResponse.sessionTokensData.filter((session) => {
            if (session) {
                signatures.push(JSON.stringify({
                    data: session.token,
                    sig: session.signature,
                }));
            }
            return null;
        });
        return {
            signatures,
            postboxkey: retrieveSharesResponse.privKey.toString(),
        };
    });
}
exports.fetchPostboxKeyAndSigs = fetchPostboxKeyAndSigs;
function assignTssKey(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { verifierName, verifierId, tssTag = "default", nonce } = opts;
        const extendedVerifierId = `${verifierId}\u0015${tssTag}\u0016${nonce}`;
        const pubKeyDetails = yield torus.getPublicAddress(torusNodeEndpoints, { verifier: verifierName, verifierId, extendedVerifierId }, true);
        return pubKeyDetails;
    });
}
exports.assignTssKey = assignTssKey;
function getTSSPubKey(dkgPubKey, userShare, userTSSIndex) {
    const userECPK = ec.curve.g.mul(userShare);
    const userSharePubKey = {
        x: userECPK.getX().toString("hex"),
        y: userECPK.getY().toString("hex"),
    };
    const serverLagrangeCoeff = getLagrangeCoeffs([1, userTSSIndex], 1);
    const userLagrangeCoeff = getLagrangeCoeffs([1, userTSSIndex], userTSSIndex);
    const serverTerm = ecPoint(dkgPubKey).mul(serverLagrangeCoeff);
    const userTerm = ecPoint(userSharePubKey).mul(userLagrangeCoeff);
    return serverTerm.add(userTerm);
}
exports.getTSSPubKey = getTSSPubKey;
const setupSockets = (tssWSEndpoints) => __awaiter(void 0, void 0, void 0, function* () {
    const sockets = yield (0, exports.createSockets)(tssWSEndpoints);
    yield new Promise((resolve) => {
        const checkConnectionTimer = setInterval(() => {
            for (let i = 0; i < sockets.length; i++) {
                if (sockets[i] !== null && !sockets[i].connected)
                    return;
            }
            clearInterval(checkConnectionTimer);
            resolve(true);
        }, 100);
    });
    return sockets;
});
exports.setupSockets = setupSockets;
const generateTSSEndpoints = (parties, clientIndex) => {
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
};
exports.generateTSSEndpoints = generateTSSEndpoints;
const parties = 4;
const clientIndex = parties - 1;
const ec = getEcCrypto();
const tssImportUrl = `https://sapphire-dev-2-2.authnetwork.dev/tss/v1/clientWasm`;
const setupWeb3 = (chainConfig, loginReponse, signingParams) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ethereumSigningProvider = new ethereum_provider_1.EthereumSigningProvider({
            config: {
                chainConfig,
            },
        });
        const { tssNonce, tssShare2, tssShare2Index, compressedTSSPubKey, signatures, } = signingParams;
        const { verifier, verifierId } = loginReponse.userInfo;
        const vid = `${verifier}${DELIMITERS.Delimiter1}${verifierId}`;
        const sessionId = `${vid}${DELIMITERS.Delimiter2}default${DELIMITERS.Delimiter3}${tssNonce}${DELIMITERS.Delimiter4}`;
        const sign = (msgHash) => __awaiter(void 0, void 0, void 0, function* () {
            const { endpoints, tssWSEndpoints, partyIndexes } = (0, exports.generateTSSEndpoints)(parties, clientIndex);
            const [sockets] = yield Promise.all([
                (0, exports.setupSockets)(tssWSEndpoints),
                tss.default(tssImportUrl),
            ]);
            const randomSessionNonce = (0, keccak256_1.default)((0, eccrypto_1.generatePrivate)().toString("hex") + Date.now());
            const currentSession = `${sessionId}${randomSessionNonce.toString("hex")}`;
            const participatingServerDKGIndexes = [1, 2, 3];
            const dklsCoeff = (0, exports.getDKLSCoeff)(true, participatingServerDKGIndexes, tssShare2Index);
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
                const serverIndex = participatingServerDKGIndexes[i];
                serverCoeffs[serverIndex] = (0, exports.getDKLSCoeff)(false, participatingServerDKGIndexes, tssShare2Index, serverIndex).toString("hex");
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
        const getPublic = () => __awaiter(void 0, void 0, void 0, function* () {
            return compressedTSSPubKey;
        });
        yield ethereumSigningProvider.setupProvider({ sign, getPublic });
        console.log(ethereumSigningProvider.provider);
        return ethereumSigningProvider.provider;
    }
    catch (e) {
        console.error(e);
        return null;
    }
});
exports.setupWeb3 = setupWeb3;
const fetchDeviceShareFromTkey = (tKey) => __awaiter(void 0, void 0, void 0, function* () {
    if (!tKey) {
        console.error("tKey not initialized yet");
        return;
    }
    try {
        const polyId = tKey.metadata.getLatestPublicPolynomial().getPolynomialID();
        const shares = tKey.shares[polyId];
        let deviceShare = null;
        for (const shareIndex in shares) {
            if (shareIndex !== "1") {
                deviceShare = shares[shareIndex];
            }
        }
        return deviceShare;
    }
    catch (err) {
        console.error({ err });
        throw new Error(err);
    }
});
const addFactorKeyMetadata = (tKey, factorKey, tssShare, tssIndex, factorKeyDescription) => __awaiter(void 0, void 0, void 0, function* () {
    if (!tKey) {
        console.error("tKey not initialized yet");
        return;
    }
    const { requiredShares } = tKey.getKeyDetails();
    if (requiredShares > 0) {
        console.error("not enough shares for metadata key");
    }
    const metadataDeviceShare = yield fetchDeviceShareFromTkey(tKey);
    const factorIndex = (0, common_types_1.getPubKeyECC)(factorKey).toString("hex");
    const metadataToSet = {
        deviceShare: metadataDeviceShare,
        tssShare,
        tssIndex,
    };
    yield tKey.addLocalMetadataTransitions({
        input: [{ message: JSON.stringify(metadataToSet) }],
        privKey: [factorKey],
    });
    const params = {
        module: factorKeyDescription,
        dateAdded: Date.now(),
        tssShareIndex: tssIndex,
    };
    yield tKey.addShareDescription(factorIndex, JSON.stringify(params), true);
});
exports.addFactorKeyMetadata = addFactorKeyMetadata;
const copyExistingTSSShareForNewFactor = (tKey, newFactorPub, factorKeyForExistingTSSShare) => __awaiter(void 0, void 0, void 0, function* () {
    if (!tKey) {
        throw new Error("tkey does not exist, cannot copy factor pub");
    }
    if (!tKey.metadata.factorPubs ||
        !Array.isArray(tKey.metadata.factorPubs[tKey.tssTag])) {
        throw new Error("factorPubs does not exist, failed in copy factor pub");
    }
    if (!tKey.metadata.factorEncs ||
        typeof tKey.metadata.factorEncs[tKey.tssTag] !== "object") {
        throw new Error("factorEncs does not exist, failed in copy factor pub");
    }
    const existingFactorPubs = tKey.metadata.factorPubs[tKey.tssTag].slice();
    const updatedFactorPubs = existingFactorPubs.concat([newFactorPub]);
    const { tssShare, tssIndex } = yield tKey.getTSSShare(factorKeyForExistingTSSShare);
    const factorEncs = JSON.parse(JSON.stringify(tKey.metadata.factorEncs[tKey.tssTag]));
    const factorPubID = newFactorPub.x.toString(16, 64);
    factorEncs[factorPubID] = {
        tssIndex,
        type: "direct",
        userEnc: yield (0, common_types_1.encrypt)(Buffer.concat([
            Buffer.from("04", "hex"),
            Buffer.from(newFactorPub.x.toString(16, 64), "hex"),
            Buffer.from(newFactorPub.y.toString(16, 64), "hex"),
        ]), Buffer.from(tssShare.toString(16, 64), "hex")),
        serverEncs: [],
    };
    tKey.metadata.addTSSData({
        tssTag: tKey.tssTag,
        factorPubs: updatedFactorPubs,
        factorEncs,
    });
});
exports.copyExistingTSSShareForNewFactor = copyExistingTSSShareForNewFactor;
const addNewTSSShareAndFactor = (tKey, newFactorPub, newFactorTSSIndex, factorKeyForExistingTSSShare, signatures) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!tKey) {
            throw new Error("tkey does not exist, cannot add factor pub");
        }
        if (!(newFactorTSSIndex === 2 || newFactorTSSIndex === 3)) {
            throw new Error("tssIndex must be 2 or 3");
        }
        if (!tKey.metadata.factorPubs ||
            !Array.isArray(tKey.metadata.factorPubs[tKey.tssTag])) {
            throw new Error("factorPubs does not exist");
        }
        const existingFactorPubs = tKey.metadata.factorPubs[tKey.tssTag].slice();
        const updatedFactorPubs = existingFactorPubs.concat([newFactorPub]);
        const existingTSSIndexes = existingFactorPubs.map((fb) => tKey.getFactorEncs(fb).tssIndex);
        const updatedTSSIndexes = existingTSSIndexes.concat([newFactorTSSIndex]);
        const { tssShare, tssIndex } = yield tKey.getTSSShare(factorKeyForExistingTSSShare);
        tKey.metadata.addTSSData({
            tssTag: tKey.tssTag,
            factorPubs: updatedFactorPubs,
        });
        const rssNodeDetails = yield tKey._getRssNodeDetails();
        const { serverEndpoints, serverPubKeys, serverThreshold } = rssNodeDetails;
        const randomSelectedServers = (0, common_types_1.randomSelection)(new Array(rssNodeDetails.serverEndpoints.length)
            .fill(null)
            .map((_, i) => i + 1), Math.ceil(rssNodeDetails.serverEndpoints.length / 2));
        const verifierNameVerifierId = tKey.serviceProvider.getVerifierNameVerifierId();
        yield tKey._refreshTSSShares(true, tssShare, tssIndex, updatedFactorPubs, updatedTSSIndexes, verifierNameVerifierId, {
            selectedServers: randomSelectedServers,
            serverEndpoints,
            serverPubKeys,
            serverThreshold,
            authSignatures: signatures,
        });
    }
    catch (err) {
        console.error(err);
        throw err;
    }
});
exports.addNewTSSShareAndFactor = addNewTSSShareAndFactor;
