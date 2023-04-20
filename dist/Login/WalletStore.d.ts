import { Socket } from "socket.io-client";
import { ethers } from "ethers";
declare class WalletStore {
    private static instance;
    static getInstance(): WalletStore;
    generateTSSEndpoints(parties: number, clientIndex: number): Promise<{
        endpoints: string[];
        tssWSEndpoints: string[];
        partyIndexes: number[];
    }>;
    getEcCrypto(): any;
    initWallet(loginReponse?: any, signingParams?: any): Promise<ethers.providers.Web3Provider | null>;
    setupSockets(tssWSEndpoints: string[]): Promise<Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>[]>;
    createSockets(wsEndpoints: string[]): Promise<Socket[]>;
}
export default WalletStore;
