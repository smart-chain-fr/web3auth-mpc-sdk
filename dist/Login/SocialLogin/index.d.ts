import BN from "bn.js";
export declare class Login {
    loginResponse: any;
    triggerLogin(): Promise<any>;
    isUserExisting(): Promise<boolean>;
    createUser(): Promise<void>;
    isLocalSharePresent(): boolean;
    checkBackupShare(value: string): Promise<boolean>;
    getFactorKeyFromLocalStore(): BN;
    reconstructKey(factorKey: BN): Promise<void>;
}
