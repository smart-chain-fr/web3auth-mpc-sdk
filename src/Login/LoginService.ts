import { getPubKeyECC, getPubKeyPoint, Point, ShareStore } from "@tkey/common-types";
import { SafeEventEmitterProvider } from "@toruslabs/base-controllers";
import BN from "bn.js";
import { generatePrivate } from "eccrypto";
import ethers from "ethers";

import CalcultationHelper from "./calculationHelper";
import { tKey } from "./tKey";
import { setupWeb3 } from "./utils";
import WalletStore from "./WalletStore";

export type FactorKeyCloudMetadata = {
  deviceShare: ShareStore;
  tssShare: BN;
  tssIndex: number;
};

export type ISigningParams = {
  tssNonce: number;
  tssShare2: BN;
  tssShare2Index: number;
  compressedTSSPubKey?: Buffer;
  signatures: any; // TO DO TYPE THIS
};

export class LoginService {
  private static instance: LoginService;
  tssShare2: BN;
  tssShare2Index: number;
  loginResponse: any;
  provider: ethers.providers.Web3Provider | null = null;

  constructor() {
    this.tssShare2 = new BN(0);
    this.tssShare2Index = 0;
  }

  static async getInstance(): Promise<LoginService> {
    if (this.instance) return this.instance;
    this.instance = new LoginService();
    await this.instance.init();
    return this.instance;
  }

  async init() {
    try {
      await (tKey.serviceProvider as any).init();
    } catch (error) {
      console.error(error);
    }
  }

  async triggerLogin() {
    if (!tKey) {
      console.error("tKey not initialized yet");
      return;
    }
    try {
      // Triggering Login using Service Provider ==> opens the popup
      const loginResponse = await (tKey.serviceProvider as any).triggerLogin({
        verifier: "google-tkey-w3a",
        typeOfLogin: "google",
        clientId:
          "774338308167-q463s7kpvja16l4l0kko3nb925ikds2p.apps.googleusercontent.com",
      });
      console.log("loginResponse", loginResponse);
      this.loginResponse = loginResponse;
      const factorKey = await this.getFactorKey();
      console.log("FACTOR KEY", factorKey.toString(16))
      const compressedTSSPubKey = await this.initTSSfromFactorKey(factorKey);
      console.log("compressedTSSPubKey", compressedTSSPubKey.toString("hex"));
      const signingParams = await this.getSigningParams(compressedTSSPubKey);
      console.log("signingParams", signingParams);
      const provider = await  WalletStore.getInstance();
      const ethereumSigningProvider = await provider.initWallet(loginResponse, signingParams);
      this.provider = ethereumSigningProvider;
      console.log("PROVIDER", ethereumSigningProvider);
      return provider;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async isUserExisting() {
    const metadata = await tKey.storageLayer.getMetadata({
      privKey: this.loginResponse.privateKey,
    });
    if (
      metadata &&
      Object.keys(metadata).length > 0 &&
      (metadata as any).message !== "KEY_NOT_FOUND"
    ) {
      return true;
    } else {
      return false;
    }
  }

  async getFactorKey() {
    let factorKey: BN | null = null;
    if (await this.isUserExisting()) {
      if (this.isLocalSharePresent()) {
        console.log("Local share present");
        factorKey = this.getFactorKeyFromLocalStore();
      } else {
        // TO DO TRIGGER BACK UP SHARE RECOVERY
        const backupShare = "coucou";
        try {
          factorKey = await this.deserializeBackupShare(backupShare);
        } catch (error) {
          console.log(error);
          throw new Error("Invalid backup share");
        }
      }
      // TO DO : UNDERSTAND WHAT THIS FUNCTION DOES
      await this.reconstructKey(factorKey);
      return factorKey;
    }
    return await this.createFactorKey();
  }

  async createFactorKey() {
    console.log("Creating factor key");
    const factorKey = new BN(generatePrivate());
    const deviceTSSShare = new BN(generatePrivate());
    const deviceTSSIndex = 2;
    const factorPub = getPubKeyPoint(factorKey);
    await tKey.initialize({
      useTSS: true,
      factorPub,
      deviceTSSShare,
      deviceTSSIndex,
    });
    return factorKey;
  }

  isLocalSharePresent() {
    const tKeyLocalStoreString = localStorage.getItem(
      `tKeyLocalStore\u001c${this.loginResponse.userInfo.verifier}\u001c${this.loginResponse.userInfo.verifierId}`
    );
    const tKeyLocalStore = JSON.parse(tKeyLocalStoreString || "{}");
    return (
      tKeyLocalStore.verifier === this.loginResponse.userInfo.verifier &&
      tKeyLocalStore.verifierId === this.loginResponse.userInfo.verifierId
    );
  }

  async deserializeBackupShare(value: string): Promise<BN> {
    const factorKey = await (
      tKey.modules["shareSerialization"] as any
    ).deserialize(value, "mnemonic");
    return factorKey;
  }

  getFactorKeyFromLocalStore() {
    const tKeyLocalStoreString = localStorage.getItem(
      `tKeyLocalStore\u001c${this.loginResponse.userInfo.verifier}\u001c${this.loginResponse.userInfo.verifierId}`
    );
    const tKeyLocalStore = JSON.parse(tKeyLocalStoreString || "{}");
    return new BN(tKeyLocalStore.factorKey, "hex");
  }

  setFactorKeyInLocalStore(factorKey: BN) {
    localStorage.setItem(
      `tKeyLocalStore\u001c${this.loginResponse.userInfo.verifier}\u001c${this.loginResponse.userInfo.verifierId}`,
      JSON.stringify({
        factorKey: factorKey.toString("hex"),
        verifier: this.loginResponse.userInfo.verifier,
        verifierId: this.loginResponse.userInfo.verifierId,
      })
    );
  }

  isMissingShares() {
    const { requiredShares } = tKey.getKeyDetails();
    return requiredShares > 0;
  }

  async reconstructKey(factorKey: BN) {
    const factorKeyMetadata = await tKey.storageLayer.getMetadata<{
      message: string;
    }>({
      privKey: factorKey,
    });
    if (factorKeyMetadata.message === "KEY_NOT_FOUND") {
      throw new Error("no metadata for your factor key, reset your account");
    }
    const metadataShare = JSON.parse(factorKeyMetadata.message);
    if (!metadataShare.deviceShare || !metadataShare.tssShare)
      throw new Error("Invalid data from metadata");
    const metadataDeviceShare = metadataShare.deviceShare;
    await tKey.initialize({ neverInitializeNewKey: true });
    await tKey.inputShareStoreSafe(metadataDeviceShare, true);
    await tKey.reconstructKey();
  }

  // tssShare1 = TSS Share from the social login/ service provider
  async getTSShare1() {
    const tssNonce: number = tKey.metadata.tssNonces![tKey.tssTag] ?? 0;
    const tssShare1PubKeyDetails = await tKey.serviceProvider.getTSSPubKey(
      tKey.tssTag,
      tssNonce
    );
    const tssShare1PubKey = new Point(
      tssShare1PubKeyDetails.x.toString("hex"),
      tssShare1PubKeyDetails.y.toString("hex")
    );
    return tssShare1PubKey;
  }

  calcultateCompressedPubKeyFromTSS(
    tssShare1PubKey: Point,
    tssShare2: BN,
    tssShare2Index: number
  ): Buffer {
    console.log("args", tssShare1PubKey, tssShare2, tssShare2Index);
    // 4. derive tss pub key, tss pubkey is implicitly formed using the dkgPubKey and the userShare (as well as userTSSIndex)
    const tssPubKey = CalcultationHelper.getTSSPubKey(
      tssShare1PubKey,
      tssShare2,
      tssShare2Index
    );
    console.log("tssPubKey", tssPubKey);

    const compressedTSSPubKey = Buffer.from(
      `${tssPubKey.getX().toString(16, 64)}${tssPubKey
        .getY()
        .toString(16, 64)}`,
      "hex"
    );
    return compressedTSSPubKey;
  }

  async getDeviceShareFromTkey() {
    // Get the latest public polynomial
    const polyId = tKey.metadata.getLatestPublicPolynomial().getPolynomialID();
    // Get the list of shares
    const shares = tKey.shares[polyId];
    // Find the device share
    let deviceShare: ShareStore | undefined;
    for (const shareIndex in shares) {
      if (shareIndex !== "1") {
        deviceShare = shares[shareIndex];
      }
    }
    return deviceShare;
  }

  async addFactorKeyMetadata(
    factorKey: BN,
    tssShare: BN,
    tssIndex: number,
    factorKeyDescription: string
  ) {
    const { requiredShares } = tKey.getKeyDetails();
    if (requiredShares > 0) {
      console.error("not enough shares for metadata key");
    }

    const metadataDeviceShare = await this.getDeviceShareFromTkey();

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
  }

  async initTSSfromFactorKey(factorKey: BN) {
    // Checks the requiredShares to reconstruct the tKey, starts from 2 by default and each of the above share reduce it by one.
    if (this.isMissingShares()) {
      const { requiredShares } = tKey.getKeyDetails();
      throw `Threshold not met. Required Share: ${requiredShares}. You should reset your account.`;
    }

    // tssShare1 = TSS Share from the social login/ service provider
    const tssShare1PubKey: Point = await this.getTSShare1();

    // tssShare2 = TSS Share from the local storage of the device
    const { tssShare: tssShare2, tssIndex: tssShare2Index } =
      await tKey.getTSSShare(factorKey);
    this.tssShare2 = tssShare2;
    this.tssShare2Index = tssShare2Index;

    // 4. derive tss pub key, tss pubkey is implicitly formed using the dkgPubKey and the userShare (as well as userTSSIndex)
    const compressedTSSPubKey = this.calcultateCompressedPubKeyFromTSS(
      tssShare1PubKey,
      tssShare2,
      tssShare2Index
    );
    // 5. save factor key and other metadata
    if (!this.isLocalSharePresent()) {
      await this.addFactorKeyMetadata(
        factorKey,
        tssShare2,
        tssShare2Index,
        "local storage share"
      );
    }
    await tKey.syncLocalMetadataTransitions();
    this.setFactorKeyInLocalStore(factorKey);
    return compressedTSSPubKey;
  }

  getSigningParams(compressedTSSPubKey: Buffer): ISigningParams {
    const to_ret: ISigningParams = {
      tssNonce: tKey.metadata.tssNonces![tKey.tssTag] ?? 0,
      compressedTSSPubKey,
      tssShare2: this.tssShare2,
      tssShare2Index: this.tssShare2Index,
      signatures: this.loginResponse.signatures.filter(
        (sign: any) => sign !== null
      ),
    };
    return to_ret;
  }

  getUser() {
    return this.loginResponse.userInfo;
  }

  async getProvider(
    chainConfig: any,
    loginReponse: any,
    signingParams: any
  ): Promise<SafeEventEmitterProvider | null> {
    return await setupWeb3(chainConfig, loginReponse, signingParams);
  }

  public async sendTransaction(tx: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse> {

		// External wallet
		const signer = await this.provider?.getSigner();
		if (!signer) throw new Error("Missing Signer");

		return signer.sendTransaction(tx);
	}

  // async getAddress() {
  //   if (!this.provider) {
  //     console.log("web3 not initialized yet");
  //     return;
  //   }
  //   const address = (await this.provider.eth.getAccounts())[0];
  //   console.log(address);
  //   return address;
  // };

  // async sendTransaction() {
  //   if (!this.provider) {
  //     console.log("web3 not initialized yet");
  //     return;
  //   }
  //   const fromAddress = (await this.provider.eth.getAccounts())[0];

  //   const destination = "0x2E464670992574A613f10F7682D5057fB507Cc21";
  //   const amount = this.provider.utils.toWei("0.0001"); // Convert 1 ether to wei

  //   // Submit transaction to the blockchain and wait for it to be mined
  //   console.log("Sending transaction...");
  //   const receipt = await this.provider.eth.sendTransaction({
  //     from: fromAddress,
  //     to: destination,
  //     value: amount,
  //   });
  //   console.log(receipt);
  // }
}
