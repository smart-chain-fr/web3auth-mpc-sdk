import { encrypt, getPubKeyECC, Point, randomSelection, ShareStore } from "@tkey/common-types";
import { SafeEventEmitterProvider } from "@toruslabs/base-controllers";
import { generatePrivate } from "@toruslabs/eccrypto";
import TorusUtils from "@toruslabs/torus.js";
import { Client } from "@toruslabs/tss-client";
import * as tss from "@toruslabs/tss-lib";
import { EthereumSigningProvider } from "@web3auth-mpc/ethereum-provider";
import BN from "bn.js";
import EC from "elliptic";
import KJUR from "jsrsasign";
import keccak256 from "keccak256";
import { io, Socket } from "socket.io-client";

const torusNodeEndpoints = [
  "https://sapphire-dev-2-1.authnetwork.dev/sss/jrpc",
  "https://sapphire-dev-2-2.authnetwork.dev/sss/jrpc",
  "https://sapphire-dev-2-3.authnetwork.dev/sss/jrpc",
  "https://sapphire-dev-2-4.authnetwork.dev/sss/jrpc",
  "https://sapphire-dev-2-5.authnetwork.dev/sss/jrpc",
];

const torus = new TorusUtils({
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

export function getEcCrypto(): any {
  // eslint-disable-next-line new-cap
  return new EC.ec("secp256k1");
}

export function ecPoint(p: { x: string; y: string }): any {
  const ec = getEcCrypto();
  return ec
    .keyFromPublic({ x: p.x.padStart(64, "0"), y: p.y.padStart(64, "0") })
    .getPublic();
}

export const getAdditiveCoeff = (
  isUser: boolean,
  participatingServerIndexes: number[],
  userTSSIndex: number,
  serverIndex?: number
): BN => {
  const ec = getEcCrypto();
  if (isUser) {
    return getLagrangeCoeffs([1, userTSSIndex], userTSSIndex);
  }
  // generate the lagrange coeff that converts the current server DKG share into an additive sharing
  const serverLagrangeCoeff = getLagrangeCoeffs(
    participatingServerIndexes,
    serverIndex as number
  );
  const masterLagrangeCoeff = getLagrangeCoeffs([1, userTSSIndex], 1);
  const additiveLagrangeCoeff = serverLagrangeCoeff
    .mul(masterLagrangeCoeff)
    .umod(ec.curve.n);
  return additiveLagrangeCoeff;
};

// Note: this is only needed for DKLS and not for FROST
export const getDenormaliseCoeff = (party: number, parties: number[]): BN => {
  if (parties.indexOf(party) === -1)
    throw new Error(`party ${party} not found in parties ${parties}`);
  const ec = getEcCrypto();
  // generate the lagrange coeff that denormalises the additive sharing into the shamir sharing that TSS is expecting
  const denormaliseLagrangeCoeff = getLagrangeCoeffs(parties, party)
    .invm(ec.curve.n)
    .umod(ec.curve.n);
  return denormaliseLagrangeCoeff;
};

export const getDKLSCoeff = (
  isUser: boolean,
  participatingServerIndexes: number[],
  userTSSIndex: number,
  serverIndex?: number
): BN => {
  const sortedServerIndexes = participatingServerIndexes.sort((a, b) => a - b);
  for (let i = 0; i < sortedServerIndexes.length; i++) {
    if (sortedServerIndexes[i] !== participatingServerIndexes[i])
      throw new Error("server indexes must be sorted");
  }
  // generate denormalise coeff for DKLS
  const parties = [];

  // total number of parties for DKLS = total number of servers + 1 (user is the last party)
  // server party indexes
  let serverPartyIndex = 0;
  for (let i = 0; i < participatingServerIndexes.length; i++) {
    const currentPartyIndex = i + 1;
    parties.push(currentPartyIndex);
    if (participatingServerIndexes[i] === serverIndex)
      serverPartyIndex = currentPartyIndex;
  }
  const userPartyIndex = parties.length + 1;
  parties.push(userPartyIndex); // user party index
  if (isUser) {
    const additiveCoeff = getAdditiveCoeff(
      isUser,
      participatingServerIndexes,
      userTSSIndex,
      serverIndex
    );
    const denormaliseCoeff = getDenormaliseCoeff(userPartyIndex, parties);
    const ec = getEcCrypto();
    return denormaliseCoeff.mul(additiveCoeff).umod(ec.curve.n);
  }
  const additiveCoeff = getAdditiveCoeff(
    isUser,
    participatingServerIndexes,
    userTSSIndex,
    serverIndex
  );
  const denormaliseCoeff = getDenormaliseCoeff(serverPartyIndex, parties);
  const ec = getEcCrypto();
  const coeff = denormaliseCoeff.mul(additiveCoeff).umod(ec.curve.n);
  return coeff;
};

export function getLagrangeCoeffs(
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

export const createSockets = async (
  wsEndpoints: string[]
): Promise<Socket[]> => {
  return wsEndpoints.map((wsEndpoint) => {
    if (wsEndpoint === null || wsEndpoint === undefined) {
      return null as any;
    }
    return io(wsEndpoint, {
      path: "/tss/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 10,
    });
  });
};

const jwtPrivateKey = `-----BEGIN PRIVATE KEY-----\nMEECAQAwEwYHKoZIzj0CAQYIKoZIzj0DAQcEJzAlAgEBBCCD7oLrcKae+jVZPGx52Cb/lKhdKxpXjl9eGNa1MlY57A==\n-----END PRIVATE KEY-----`;
export const generateIdToken = (email: any) => {
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
  // @ts-ignore
  const token = KJUR.jws.JWS.sign(alg, header, payload, jwtPrivateKey, options);

  return token;
};

export async function fetchPostboxKeyAndSigs(opts: any) {
  const { verifierName, verifierId } = opts;
  const token = generateIdToken(verifierId);

  const retrieveSharesResponse = await torus.retrieveShares(
    torusNodeEndpoints,
    verifierName,
    { verifier_id: verifierId },
    token
  );

  const signatures: any = [];
  retrieveSharesResponse.sessionTokensData.filter((session) => {
    if (session) {
      signatures.push(
        JSON.stringify({
          data: session.token,
          sig: session.signature,
        })
      );
    }
    return null;
  });

  return {
    signatures,
    postboxkey: retrieveSharesResponse.privKey.toString(),
  };
}

export async function assignTssKey(opts: any) {
  const { verifierName, verifierId, tssTag = "default", nonce } = opts;
  const extendedVerifierId = `${verifierId}\u0015${tssTag}\u0016${nonce}`;
  const pubKeyDetails = await torus.getPublicAddress(
    torusNodeEndpoints,
    { verifier: verifierName, verifierId, extendedVerifierId },
    true
  );

  return pubKeyDetails;
}

export function getTSSPubKey(
  dkgPubKey: any,
  userShare: any,
  userTSSIndex: number
): any {
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

export const setupSockets = async (tssWSEndpoints: string[]) => {
  const sockets = await createSockets(tssWSEndpoints);
  // wait for websockets to be connected
  await new Promise((resolve) => {
    const checkConnectionTimer = setInterval(() => {
      for (let i = 0; i < sockets.length; i++) {
        if (sockets[i] !== null && !sockets[i]!.connected) return;
      }
      clearInterval(checkConnectionTimer);
      resolve(true);
    }, 100);
  });

  return sockets;
};

export const generateTSSEndpoints = (parties: number, clientIndex: number) => {
  const endpoints: string[] = [];
  const tssWSEndpoints: string[] = [];
  const partyIndexes: number[] = [];
  for (let i = 0; i < parties; i++) {
    partyIndexes.push(i);
    if (i === clientIndex) {
      endpoints.push(null as any);
      tssWSEndpoints.push(null as any);
    } else {
      endpoints.push(`https://sapphire-dev-2-${i + 1}.authnetwork.dev/tss`);
      tssWSEndpoints.push(`https://sapphire-dev-2-${i + 1}.authnetwork.dev`);
    }
  }
  return { endpoints, tssWSEndpoints, partyIndexes };
};

const parties = 4;
const clientIndex = parties - 1;
const ec = getEcCrypto();

const tssImportUrl = `https://sapphire-dev-2-2.authnetwork.dev/tss/v1/clientWasm`;

export const setupWeb3 = async (
  chainConfig: any,
  loginReponse: any,
  signingParams: any
): Promise<SafeEventEmitterProvider | null> => {
  try {
    const ethereumSigningProvider = new EthereumSigningProvider({
      config: {
        chainConfig,
      },
    });

    const {
      tssNonce,
      tssShare2,
      tssShare2Index,
      compressedTSSPubKey,
      signatures,
    } = signingParams;

    const { verifier, verifierId } = loginReponse.userInfo;

    const vid = `${verifier}${DELIMITERS.Delimiter1}${verifierId}`;
    const sessionId = `${vid}${DELIMITERS.Delimiter2}default${DELIMITERS.Delimiter3}${tssNonce}${DELIMITERS.Delimiter4}`;

    /*
    pass user's private key here.
    after calling setupProvider, we can use
    */
    const sign = async (msgHash: Buffer) => {
      // 1. setup
      // generate endpoints for servers
      const { endpoints, tssWSEndpoints, partyIndexes } = generateTSSEndpoints(
        parties,
        clientIndex
      );
      // setup mock shares, sockets and tss wasm files.
      const [sockets] = await Promise.all([
        setupSockets(tssWSEndpoints),
        tss.default(tssImportUrl),
      ]);

      const randomSessionNonce = keccak256(
        generatePrivate().toString("hex") + Date.now()
      );

      // session is needed for authentication to the web3auth infrastructure holding the factor 1
      const currentSession = `${sessionId}${randomSessionNonce.toString(
        "hex"
      )}`;

      const participatingServerDKGIndexes = [1, 2, 3];
      const dklsCoeff = getDKLSCoeff(
        true,
        participatingServerDKGIndexes,
        tssShare2Index
      );
      const denormalisedShare = dklsCoeff.mul(tssShare2).umod(ec.curve.n);
      const share = Buffer.from(
        denormalisedShare.toString(16, 64),
        "hex"
      ).toString("base64");

      if (!currentSession) {
        throw new Error(`sessionAuth does not exist ${currentSession}`);
      }
      if (!signatures) {
        throw new Error(`Signature does not exist ${signatures}`);
      }

      const client = new Client(
        currentSession,
        clientIndex,
        partyIndexes,
        endpoints,
        sockets,
        share,
        compressedTSSPubKey.toString("base64"),
        true,
        tssImportUrl
      );
      const serverCoeffs: any = {};
      for (let i = 0; i < participatingServerDKGIndexes.length; i++) {
        const serverIndex = participatingServerDKGIndexes[i];
        serverCoeffs[serverIndex!] = getDKLSCoeff(
          false,
          participatingServerDKGIndexes,
          tssShare2Index,
          serverIndex
        ).toString("hex");
      }
      client.precompute(tss, { signatures, server_coeffs: serverCoeffs });
      await client.ready();
      const { r, s, recoveryParam } = await client.sign(
        tss as any,
        Buffer.from(msgHash).toString("base64"),
        true,
        "",
        "keccak256",
        {
          signatures,
        }
      );
      await client.cleanup(tss, { signatures, server_coeffs: serverCoeffs });
      return {
        v: recoveryParam,
        r: Buffer.from(r.toString("hex"), "hex"),
        s: Buffer.from(s.toString("hex"), "hex"),
      };
    };

    if (!compressedTSSPubKey) {
      throw new Error(
        `compressedTSSPubKey does not exist ${compressedTSSPubKey}`
      );
    }

    const getPublic: () => Promise<Buffer> = async () => {
      return compressedTSSPubKey;
    };

    await ethereumSigningProvider.setupProvider({ sign, getPublic });
    console.log(ethereumSigningProvider.provider);
    // const web3 = new Web3(ethereumSigningProvider.provider as provider);

    return ethereumSigningProvider.provider as SafeEventEmitterProvider;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const fetchDeviceShareFromTkey = async (tKey: any) => {
  if (!tKey) {
    console.error("tKey not initialized yet");
    return;
  }
  try {
    const polyId = tKey.metadata.getLatestPublicPolynomial().getPolynomialID();
    const shares = tKey.shares[polyId];
    let deviceShare: ShareStore | null = null;

    for (const shareIndex in shares) {
      if (shareIndex !== "1") {
        deviceShare = shares[shareIndex];
      }
    }
    return deviceShare;
  } catch (err: any) {
    console.error({ err });
    throw new Error(err);
  }
};

export type FactorKeyCloudMetadata = {
  deviceShare: ShareStore;
  tssShare: BN;
  tssIndex: number;
};

export const addFactorKeyMetadata = async (
  tKey: any,
  factorKey: BN,
  tssShare: BN,
  tssIndex: number,
  factorKeyDescription: string
) => {
  if (!tKey) {
    console.error("tKey not initialized yet");
    return;
  }
  const { requiredShares } = tKey.getKeyDetails();
  if (requiredShares > 0) {
    console.error("not enough shares for metadata key");
  }

  const metadataDeviceShare = await fetchDeviceShareFromTkey(tKey);

  const factorIndex = getPubKeyECC(factorKey).toString("hex");
  const metadataToSet: FactorKeyCloudMetadata = {
    deviceShare: metadataDeviceShare as ShareStore,
    tssShare,
    tssIndex,
  };

  // Set metadata for factor key backup
  await tKey.addLocalMetadataTransitions({
    input: [{ message: JSON.stringify(metadataToSet) }],
    privKey: [factorKey],
  });

  // also set a description on tkey
  const params = {
    module: factorKeyDescription,
    dateAdded: Date.now(),
    tssShareIndex: tssIndex,
  };
  await tKey.addShareDescription(factorIndex, JSON.stringify(params), true);
};

export const copyExistingTSSShareForNewFactor = async (
  tKey: any,
  newFactorPub: Point,
  factorKeyForExistingTSSShare: BN
) => {
  if (!tKey) {
    throw new Error("tkey does not exist, cannot copy factor pub");
  }
  if (
    !tKey.metadata.factorPubs ||
    !Array.isArray(tKey.metadata.factorPubs[tKey.tssTag])
  ) {
    throw new Error("factorPubs does not exist, failed in copy factor pub");
  }
  if (
    !tKey.metadata.factorEncs ||
    typeof tKey.metadata.factorEncs[tKey.tssTag] !== "object"
  ) {
    throw new Error("factorEncs does not exist, failed in copy factor pub");
  }

  const existingFactorPubs = tKey.metadata.factorPubs[tKey.tssTag].slice();
  const updatedFactorPubs = existingFactorPubs.concat([newFactorPub]);
  const { tssShare, tssIndex } = await tKey.getTSSShare(
    factorKeyForExistingTSSShare
  );

  const factorEncs = JSON.parse(
    JSON.stringify(tKey.metadata.factorEncs[tKey.tssTag])
  );
  const factorPubID = newFactorPub.x.toString(16, 64);
  factorEncs[factorPubID] = {
    tssIndex,
    type: "direct",
    userEnc: await encrypt(
      Buffer.concat([
        Buffer.from("04", "hex"),
        Buffer.from(newFactorPub.x.toString(16, 64), "hex"),
        Buffer.from(newFactorPub.y.toString(16, 64), "hex"),
      ]),
      Buffer.from(tssShare.toString(16, 64), "hex")
    ),
    serverEncs: [],
  };
  tKey.metadata.addTSSData({
    tssTag: tKey.tssTag,
    factorPubs: updatedFactorPubs,
    factorEncs,
  });
};

export const addNewTSSShareAndFactor = async (
  tKey: any,
  newFactorPub: Point,
  newFactorTSSIndex: number,
  factorKeyForExistingTSSShare: BN,
  signatures: any
) => {
  try {
    if (!tKey) {
      throw new Error("tkey does not exist, cannot add factor pub");
    }
    if (!(newFactorTSSIndex === 2 || newFactorTSSIndex === 3)) {
      throw new Error("tssIndex must be 2 or 3");
    }
    if (
      !tKey.metadata.factorPubs ||
      !Array.isArray(tKey.metadata.factorPubs[tKey.tssTag])
    ) {
      throw new Error("factorPubs does not exist");
    }

    const existingFactorPubs = tKey.metadata.factorPubs[tKey.tssTag].slice();
    const updatedFactorPubs = existingFactorPubs.concat([newFactorPub]);
    const existingTSSIndexes = existingFactorPubs.map(
      (fb: any) => tKey.getFactorEncs(fb).tssIndex
    );
    const updatedTSSIndexes = existingTSSIndexes.concat([newFactorTSSIndex]);
    const { tssShare, tssIndex } = await tKey.getTSSShare(
      factorKeyForExistingTSSShare
    );

    tKey.metadata.addTSSData({
      tssTag: tKey.tssTag,
      factorPubs: updatedFactorPubs,
    });

    const rssNodeDetails = await tKey._getRssNodeDetails();
    const { serverEndpoints, serverPubKeys, serverThreshold } = rssNodeDetails;
    const randomSelectedServers = randomSelection(
      new Array(rssNodeDetails.serverEndpoints.length)
        .fill(null)
        .map((_, i) => i + 1),
      Math.ceil(rssNodeDetails.serverEndpoints.length / 2)
    );

    const verifierNameVerifierId =
      tKey.serviceProvider.getVerifierNameVerifierId();
    await tKey._refreshTSSShares(
      true,
      tssShare,
      tssIndex,
      updatedFactorPubs,
      updatedTSSIndexes,
      verifierNameVerifierId,
      {
        selectedServers: randomSelectedServers,
        serverEndpoints,
        serverPubKeys,
        serverThreshold,
        authSignatures: signatures,
      }
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
};
