import { getPubKeyPoint, ShareStore } from "@tkey/common-types";
import BN from "bn.js";
import { generatePrivate } from "eccrypto";

import { tKey } from "../tKey";

export type FactorKeyCloudMetadata = {
  deviceShare: ShareStore;
  tssShare: BN;
  tssIndex: number;
};

export class LoginService {
  private static instance: LoginService;
  loginResponse: any;

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
      return loginResponse;
    } catch (error) {
      console.log(error);
    }
  }

  async isUserExists() {
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

  async getFactorKey(): Promise<BN> {
    if (this.isLocalSharePresent()) {
      return this.getFactorKeyFromLocalStore();
    }
    return await this.getFactorKeyFromBackupShare();
  }

  async initializeKey() {
    let factorKey: BN | null = null;
    const isUserExists = await this.isUserExists();
    if (!isUserExists) {
      factorKey = new BN(generatePrivate());
      await this.initializeNewKey(factorKey);
    } else {
      try {
        factorKey = await this.getFactorKey();
        await this.initializeFromExistingFactorKey(factorKey);
      } catch (error) {
        console.log(error);
      }
    }
    try {
      if (!factorKey) throw new Error("factor key not found");
      await tKey.reconstructKey();
      this.checkMissingShares();
      const tssShare1 = this.getTSShare1();
      const tssShare2 = this.getTSShare2(factorKey);
    } catch (error) {
      console.log(error);
    }
  }

  async initializeNewKey(factorKey: BN) {
    const deviceTSSShare = new BN(generatePrivate());
    const deviceTSSIndex = 2;
    const factorPub = getPubKeyPoint(factorKey);
    await tKey.initialize({
      useTSS: true,
      factorPub,
      deviceTSSShare,
      deviceTSSIndex,
    });
  }

  async initializeFromExistingFactorKey(factorKey: BN) {
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

  async getFactorKeyFromBackupShare(): Promise<BN> {
    // TO DO TRIGGER BACK UP SHARE RECOVERY
    const backupShare = "recovery share";
    try {
      return await this.deserializeBackupShare(backupShare);
    } catch (error) {
      console.log(error);
      throw new Error("Invalid backup share");
    }
  }

  checkMissingShares() {
    const { requiredShares } = tKey.getKeyDetails();
    if (requiredShares > 0) {
      throw `Threshold not met. Required Share: ${requiredShares}. You should reset your account.`;
    }
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
    const tssShare1PubKey = {
      x: tssShare1PubKeyDetails.x.toString("hex"),
      y: tssShare1PubKeyDetails.y.toString("hex"),
    };
    return tssShare1PubKey;
  }

  // tssShare2 = TSS Share from the local storage of the device
  async getTSShare2(factorKey: BN) {
    return await tKey.getTSSShare(factorKey);
  }
}
