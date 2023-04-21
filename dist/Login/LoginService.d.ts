/// <reference types="node" />
import { Point, ShareStore } from "@tkey/common-types";
import { SafeEventEmitterProvider } from "@toruslabs/base-controllers";
import BN from "bn.js";
import ethers from "ethers";
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
    signatures: any;
};
export declare class Web3AuthMPCWallet {
    private static instance;
    tssShare2: BN;
    tssShare2Index: number;
    loginResponse: any;
    provider: ethers.providers.Web3Provider | null;
    constructor();
    static getInstance(): Promise<Web3AuthMPCWallet>;
    init(): Promise<void>;
    triggerLogin(): Promise<ethers.providers.Web3Provider | null>;
    isUserExisting(): Promise<boolean>;
    getFactorKey(): Promise<BN>;
    createFactorKey(): Promise<BN>;
    isLocalSharePresent(): boolean;
    deserializeBackupShare(value: string): Promise<BN>;
    getFactorKeyFromLocalStore(): BN;
    setFactorKeyInLocalStore(factorKey: BN): void;
    isMissingShares(): boolean;
    reconstructKey(factorKey: BN): Promise<void>;
    getTSShare1(): Promise<Point>;
    calcultateCompressedPubKeyFromTSS(tssShare1PubKey: Point, tssShare2: BN, tssShare2Index: number): Buffer;
    getDeviceShareFromTkey(): Promise<ShareStore | undefined>;
    addFactorKeyMetadata(factorKey: BN, tssShare: BN, tssIndex: number, factorKeyDescription: string): Promise<void>;
    initTSSfromFactorKey(factorKey: BN): Promise<Buffer>;
    getSigningParams(compressedTSSPubKey: Buffer): ISigningParams;
    getUser(): any;
    getProvider(chainConfig: any, loginReponse: any, signingParams: any): Promise<SafeEventEmitterProvider | null>;
    sendTransaction(tx: ethers.providers.TransactionRequest): Promise<ethers.providers.TransactionResponse>;
    getAddress(): Promise<string | undefined>;
    logOut(): Promise<void>;
}
