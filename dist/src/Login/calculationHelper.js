"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDenormaliseCoeff = exports.getAdditiveCoeff = void 0;
const common_types_1 = require("@tkey/common-types");
const bn_js_1 = __importDefault(require("bn.js"));
const elliptic_1 = __importDefault(require("elliptic"));
function getEcCrypto() {
    return new elliptic_1.default.ec("secp256k1");
}
function ecPoint(p) {
    const ec = getEcCrypto();
    return ec
        .keyFromPublic({
        x: p.x.toString().padStart(64, "0"),
        y: p.y.toString().padStart(64, "0"),
    })
        .getPublic();
}
function getTSSPubKey(dkgPubKey, userShare, userTSSIndex) {
    console.log("ARGS", dkgPubKey, userShare, userTSSIndex);
    const ec = getEcCrypto();
    const userECPK = ec.curve.g.mul(userShare);
    const userSharePubKey = new common_types_1.Point(userECPK.getX().toString("hex"), userECPK.getY().toString("hex"));
    const serverLagrangeCoeff = getLagrangeCoeffs([1, userTSSIndex], 1);
    const userLagrangeCoeff = getLagrangeCoeffs([1, userTSSIndex], userTSSIndex);
    const serverTerm = ecPoint(dkgPubKey).mul(serverLagrangeCoeff);
    const userTerm = ecPoint(userSharePubKey).mul(userLagrangeCoeff);
    return serverTerm.add(userTerm);
}
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
const getAdditiveCoeff = (isUser, participatingServerIndexes, userTSSIndex, serverIndex) => {
    const ec = getEcCrypto();
    if (isUser) {
        return getLagrangeCoeffs([1, userTSSIndex], userTSSIndex);
    }
    const serverLagrangeCoeff = getLagrangeCoeffs(participatingServerIndexes, serverIndex);
    const masterLagrangeCoeff = getLagrangeCoeffs([1, userTSSIndex], 1);
    const additiveLagrangeCoeff = serverLagrangeCoeff.mul(masterLagrangeCoeff).umod(ec.curve.n);
    return additiveLagrangeCoeff;
};
exports.getAdditiveCoeff = getAdditiveCoeff;
const getDenormaliseCoeff = (party, parties) => {
    if (parties.indexOf(party) === -1)
        throw new Error(`party ${party} not found in parties ${parties}`);
    const ec = getEcCrypto();
    const denormaliseLagrangeCoeff = getLagrangeCoeffs(parties, party).invm(ec.curve.n).umod(ec.curve.n);
    return denormaliseLagrangeCoeff;
};
exports.getDenormaliseCoeff = getDenormaliseCoeff;
function getDKLSCoeff(isUser, participatingServerIndexes, userTSSIndex, serverIndex) {
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
}
;
const CalcultationHelper = { getTSSPubKey, getLagrangeCoeffs, getDKLSCoeff };
exports.default = CalcultationHelper;
