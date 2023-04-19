import { Point } from "@tkey/common-types";
import BN from "bn.js";
import EC from "elliptic";

function getEcCrypto(): EC.ec {
  // eslint-disable-next-line new-cap
  return new EC.ec("secp256k1");
}

function ecPoint(p: Point): EC.curve.base.BasePoint {
  const ec = getEcCrypto();
  return ec
    .keyFromPublic({
      x: p.x.toString().padStart(64, "0"),
      y: p.y.toString().padStart(64, "0"),
    })
    .getPublic();
}

// This function calculates the public key for a given TSS.
// The public key is calculated using the following formula:
//   - K = (g^a)+(K_1^b)
// where:
//   - K is the public key for the TSS
//   - g is the generator point
//   - a is the server's lagrange coefficient
//   - K_1 is the public key for the user
//   - b is the user's lagrange coefficient
//   - ^ is the elliptic curve point multiplication operator

function getTSSPubKey(
  dkgPubKey: Point,
  userShare: BN,
  userTSSIndex: number
): any {
  console.log("ARGS", dkgPubKey, userShare, userTSSIndex);
  // Calculate the public key for the TSS
  const ec = getEcCrypto();
  const userECPK = ec.curve.g.mul(userShare);
  const userSharePubKey = new Point(
    userECPK.getX().toString("hex"),
    userECPK.getY().toString("hex")
  );

  const serverLagrangeCoeff: BN = getLagrangeCoeffs([1, userTSSIndex], 1);
  const userLagrangeCoeff: BN = getLagrangeCoeffs(
    [1, userTSSIndex],
    userTSSIndex
  );
  const serverTerm: EC.curve.base.BasePoint =
    ecPoint(dkgPubKey).mul(serverLagrangeCoeff);
  const userTerm: EC.curve.base.BasePoint =
    ecPoint(userSharePubKey).mul(userLagrangeCoeff);
  return serverTerm.add(userTerm);
}

function getLagrangeCoeffs(
  _allIndexes: number[] | BN[],
  _myIndex: number | BN,
  _target: number | BN = 0
): BN {
  const ec = getEcCrypto();
  const allIndexes: BN[] = _allIndexes.map((i) => new BN(i));
  const myIndex: BN = new BN(_myIndex);
  const target: BN = new BN(_target);
  let upper = new BN(1);
  let lower = new BN(1);
  for (let j = 0; j < allIndexes.length; j += 1) {
    if (myIndex.cmp(allIndexes[j]!) !== 0) {
      let tempUpper = target.sub(allIndexes[j]!);
      tempUpper = tempUpper.umod(ec.curve.n);
      upper = upper.mul(tempUpper);
      upper = upper.umod(ec.curve.n);
      let tempLower = myIndex.sub(allIndexes[j]!);
      tempLower = tempLower.umod(ec.curve.n);
      lower = lower.mul(tempLower).umod(ec.curve.n);
    }
  }
  return upper.mul(lower.invm(ec.curve.n)).umod(ec.curve.n);
}

export const getAdditiveCoeff = (isUser: boolean, participatingServerIndexes: number[], userTSSIndex: number, serverIndex?: number): BN => {
  const ec = getEcCrypto();
  if (isUser) {
    return getLagrangeCoeffs([1, userTSSIndex], userTSSIndex);
  }
  // generate the lagrange coeff that converts the current server DKG share into an additive sharing
  const serverLagrangeCoeff = getLagrangeCoeffs(participatingServerIndexes, serverIndex as number);
  const masterLagrangeCoeff = getLagrangeCoeffs([1, userTSSIndex], 1);
  const additiveLagrangeCoeff = serverLagrangeCoeff.mul(masterLagrangeCoeff).umod(ec.curve.n);
  return additiveLagrangeCoeff;
};

// Note: this is only needed for DKLS and not for FROST
export const getDenormaliseCoeff = (party: number, parties: number[]): BN => {
  if (parties.indexOf(party) === -1) throw new Error(`party ${party} not found in parties ${parties}`);
  const ec = getEcCrypto();
  // generate the lagrange coeff that denormalises the additive sharing into the shamir sharing that TSS is expecting
  const denormaliseLagrangeCoeff = getLagrangeCoeffs(parties, party).invm(ec.curve.n).umod(ec.curve.n);
  return denormaliseLagrangeCoeff;
};

function getDKLSCoeff(isUser: boolean, participatingServerIndexes: number[], userTSSIndex: number, serverIndex?: number): BN {
  const sortedServerIndexes = participatingServerIndexes.sort((a, b) => a - b);
  for (let i = 0; i < sortedServerIndexes.length; i++) {
    if (sortedServerIndexes[i] !== participatingServerIndexes[i]) throw new Error("server indexes must be sorted");
  }
  // generate denormalise coeff for DKLS
  const parties = [];

  // total number of parties for DKLS = total number of servers + 1 (user is the last party)
  // server party indexes
  let serverPartyIndex = 0;
  for (let i = 0; i < participatingServerIndexes.length; i++) {
    const currentPartyIndex = i + 1;
    parties.push(currentPartyIndex);
    if (participatingServerIndexes[i] === serverIndex) serverPartyIndex = currentPartyIndex;
  }
  const userPartyIndex = parties.length + 1;
  parties.push(userPartyIndex); // user party index
  if (isUser) {
    const additiveCoeff = getAdditiveCoeff(isUser, participatingServerIndexes, userTSSIndex, serverIndex);
    const denormaliseCoeff = getDenormaliseCoeff(userPartyIndex, parties);
    const ec = getEcCrypto();
    return denormaliseCoeff.mul(additiveCoeff).umod(ec.curve.n);
  }
  const additiveCoeff = getAdditiveCoeff(isUser, participatingServerIndexes, userTSSIndex, serverIndex);
  const denormaliseCoeff = getDenormaliseCoeff(serverPartyIndex, parties);
  const ec = getEcCrypto();
  const coeff = denormaliseCoeff.mul(additiveCoeff).umod(ec.curve.n);
  return coeff;
};

const CalcultationHelper = { getTSSPubKey, getLagrangeCoeffs, getDKLSCoeff };
export default CalcultationHelper;
