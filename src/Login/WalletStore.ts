import EC from "elliptic";
import { io, Socket } from "socket.io-client";

import { generatePrivate } from "@toruslabs/eccrypto";
import { Client } from "@toruslabs/tss-client";
import * as tss from "@toruslabs/tss-lib";
import { EthereumSigningProvider } from "@web3auth-mpc/ethereum-provider";
import keccak256 from "keccak256";
import CalcultationHelper from "./calculationHelper";
import Config from "../Config";
import { ethers } from "ethers";

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
  private static instance: WalletStore;

  static getInstance() {
    return (this.instance = this.instance ?? new WalletStore());
  }

  async generateTSSEndpoints(parties: number, clientIndex: number) {
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
  }

  getEcCrypto(): any {
    // eslint-disable-next-line new-cap
    return new EC.ec("secp256k1");
  }

  async initWallet(loginReponse?: any, signingParams?: any) {
    try {
      const config = Config.getInstance().get();
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

      // 1. Create a new session ID with the verifier's info, the nonce and the delimiter
      const vid = `${verifier}${DELIMITERS.Delimiter1}${verifierId}`;
      const sessionId = `${vid}${DELIMITERS.Delimiter2}default${DELIMITERS.Delimiter3}${tssNonce}${DELIMITERS.Delimiter4}`;
      /*
    pass user's private key here.
    after calling setupProvider, we can use
    */
      const sign = async (msgHash: Buffer) => {
        // 1. setup
        // generate endpoints for servers
        const { endpoints, tssWSEndpoints, partyIndexes } =
          await this.generateTSSEndpoints(parties, clientIndex);
        // setup mock shares, sockets and tss wasm files.
        const [sockets] = await Promise.all([
          this.setupSockets(tssWSEndpoints),
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
        const dklsCoeff = CalcultationHelper.getDKLSCoeff(
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
          const serverIndex = participatingServerDKGIndexes[i] ?? 0;
          serverCoeffs[serverIndex] = CalcultationHelper.getDKLSCoeff(
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
      const provider = new ethers.providers.Web3Provider(
        ethereumSigningProvider.provider as any
      );
      return provider;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async setupSockets(tssWSEndpoints: string[]) {
    const sockets = await this.createSockets(tssWSEndpoints);
    // wait for websockets to be connected
    await new Promise((resolve) => {
      const checkConnectionTimer = setInterval(() => {
        for (let i = 0; i < sockets.length; i++) {
          if (sockets[i] && sockets[i] !== null && !sockets[i]!.connected)
            return;
        }
        clearInterval(checkConnectionTimer);
        resolve(true);
      }, 100);
    });

    return sockets;
  }

  async createSockets(wsEndpoints: string[]): Promise<Socket[]> {
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
  }
}

export default WalletStore;
