import type { SafeEventEmitterProvider } from "@web3auth-mpc/base";
export default class EthereumRpc {
    private provider;
    constructor(provider: SafeEventEmitterProvider);
    getChainId(): Promise<any>;
    getAccounts(): Promise<any>;
    getBalance(): Promise<string>;
    sendTransaction(): Promise<any>;
    signMessage(): Promise<string>;
    getPrivateKey(): Promise<any>;
}
