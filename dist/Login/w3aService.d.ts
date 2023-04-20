import { SafeEventEmitterProvider } from "@web3auth-mpc/base";
import { Web3Auth, Web3AuthOptions } from "@web3auth-mpc/web3auth";
export declare class W3aService {
    private static instance;
    private _web3auth;
    private _provider;
    static getInstance(): W3aService;
    get web3auth(): Web3Auth | null;
    get provider(): SafeEventEmitterProvider | null;
    initEthAuth(web3AuthOptions: Web3AuthOptions): Promise<void>;
    login(): Promise<void>;
    getUserInfo(): Promise<void>;
    logout(): Promise<void>;
    getChainId(): Promise<void>;
    getAccounts(): Promise<void>;
    getBalance(): Promise<void>;
    signTransaction(): Promise<void>;
    sendTransaction(): Promise<void>;
    signMessage(): Promise<void>;
}
export default W3aService;
