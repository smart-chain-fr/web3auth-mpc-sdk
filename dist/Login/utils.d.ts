import { Point, ShareStore } from "@tkey/common-types";
import { SafeEventEmitterProvider } from "@toruslabs/base-controllers";
import BN from "bn.js";
import { Socket } from "socket.io-client";
export declare function getEcCrypto(): any;
export declare function ecPoint(p: {
    x: string;
    y: string;
}): any;
export declare const getAdditiveCoeff: (isUser: boolean, participatingServerIndexes: number[], userTSSIndex: number, serverIndex?: number) => BN;
export declare const getDenormaliseCoeff: (party: number, parties: number[]) => BN;
export declare const getDKLSCoeff: (isUser: boolean, participatingServerIndexes: number[], userTSSIndex: number, serverIndex?: number) => BN;
export declare function getLagrangeCoeffs(_allIndexes: number[] | BN[], _myIndex: number | BN, _target?: number | BN): BN;
export declare const createSockets: (wsEndpoints: string[]) => Promise<Socket[]>;
export declare const generateIdToken: (email: any) => any;
export declare function fetchPostboxKeyAndSigs(opts: any): Promise<{
    signatures: any;
    postboxkey: string;
}>;
export declare function assignTssKey(opts: any): Promise<string | import("@toruslabs/torus.js").TorusPublicKey>;
export declare function getTSSPubKey(dkgPubKey: any, userShare: any, userTSSIndex: number): any;
export declare const setupSockets: (tssWSEndpoints: string[]) => Promise<Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>[]>;
export declare const generateTSSEndpoints: (parties: number, clientIndex: number) => {
    endpoints: string[];
    tssWSEndpoints: string[];
    partyIndexes: number[];
};
export declare const setupWeb3: (chainConfig: any, loginReponse: any, signingParams: any) => Promise<SafeEventEmitterProvider | null>;
export type FactorKeyCloudMetadata = {
    deviceShare: ShareStore;
    tssShare: BN;
    tssIndex: number;
};
export declare const addFactorKeyMetadata: (tKey: any, factorKey: BN, tssShare: BN, tssIndex: number, factorKeyDescription: string) => Promise<void>;
export declare const copyExistingTSSShareForNewFactor: (tKey: any, newFactorPub: Point, factorKeyForExistingTSSShare: BN) => Promise<void>;
export declare const addNewTSSShareAndFactor: (tKey: any, newFactorPub: Point, newFactorTSSIndex: number, factorKeyForExistingTSSShare: BN, signatures: any) => Promise<void>;
