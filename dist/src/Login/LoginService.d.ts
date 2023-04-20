/// <reference types="node" />
import BN from "bn.js";
import { Point, ShareStore } from "@tkey/common-types";
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
export declare class LoginService {
    private static instance;
    tssShare2: BN;
    tssShare2Index: number;
    loginResponse: any;
    constructor();
    static getInstance(): Promise<LoginService>;
    init(): Promise<void>;
    triggerLogin(): Promise<any>;
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
    getSigningParams(): ISigningParams;
    getUser(): any;
}
