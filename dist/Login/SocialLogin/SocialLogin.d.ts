import ThresholdKey from "@tkey/core/dist/types/core";
export declare class SocialLogin {
    tKey: ThresholdKey;
    loginResponse: any;
    constructor();
    triggerLogin(): Promise<any>;
    isUserExisting(): Promise<boolean>;
}
