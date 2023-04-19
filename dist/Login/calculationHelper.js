"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const CalcultationHelper = { getTSSPubKey, getLagrangeCoeffs };
exports.default = CalcultationHelper;
