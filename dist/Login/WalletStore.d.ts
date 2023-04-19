import { Socket } from "socket.io-client";
export declare const CHAIN_NAMESPACES: {
    readonly EIP155: "eip155";
    readonly SOLANA: "solana";
    readonly OTHER: "other";
};
declare class WalletStore {
    generateTSSEndpoints(parties: number, clientIndex: number): Promise<{
        endpoints: string[];
        tssWSEndpoints: string[];
        partyIndexes: number[];
    }>;
    getEcCrypto(): any;
    initWallet(loginReponse?: any, signingParams?: any): Promise<void>;
    setupSockets(tssWSEndpoints: string[]): Promise<Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>[]>;
    createSockets(wsEndpoints: string[]): Promise<Socket[]>;
}
export default WalletStore;
