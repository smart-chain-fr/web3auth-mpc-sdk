import { SafeEventEmitterProvider } from "@web3auth-mpc/base";
import { Web3Auth } from "@web3auth-mpc/web3auth";
declare class w3aService {
    web3auth: Web3Auth | null;
    provider: SafeEventEmitterProvider | null;
    initEthAuth(): Promise<void>;
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
export default w3aService;
