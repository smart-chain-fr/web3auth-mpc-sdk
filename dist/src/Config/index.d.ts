export default class Config {
    private static ctx;
    private config;
    private constructor();
    static getInstance(): Config;
    get(): {
        app: string;
        domain: string;
        roundedDecimals: string;
        blockchain: {
            type: string;
            ethereum: {
                infuraId: string;
                rpc: string;
                network: string;
                name: string;
                blockExplorer: string;
                chainId: number;
                chainIdHexa: string;
                ticker: string;
                tickerName: string;
                contracts: {
                    nftCollection: string;
                };
            };
            tezos: {
                name: string;
                network: string;
                rpc: string;
                tzktApi: string;
                contracts: {
                    factory: string;
                    proxy: string;
                    domainName: string;
                };
            };
        };
        wallet: {
            type: string;
            ethereum: {
                web3modal: {
                    providers: {
                        walletConnect: {
                            enabled: boolean;
                        };
                        torus: {
                            enabled: boolean;
                        };
                        binanceChainWallet: {
                            enabled: boolean;
                        };
                    };
                    openlogin: {
                        label: string;
                        enabled: boolean;
                        loginMethods: {
                            enabled: boolean;
                            google: {
                                name: string;
                                enabled: boolean;
                            };
                            facebook: {
                                name: string;
                                enabled: boolean;
                            };
                            discord: {
                                name: string;
                                enabled: boolean;
                            };
                            apple: {
                                name: string;
                                enabled: boolean;
                            };
                            twitch: {
                                name: string;
                                enabled: boolean;
                            };
                            reddit: {
                                name: string;
                                enabled: boolean;
                            };
                            line: {
                                name: string;
                                enabled: boolean;
                            };
                            github: {
                                name: string;
                                enabled: boolean;
                            };
                            kakao: {
                                name: string;
                                enabled: boolean;
                            };
                            linkedin: {
                                name: string;
                                enabled: boolean;
                            };
                            weibo: {
                                name: string;
                                enabled: boolean;
                            };
                            wechat: {
                                name: string;
                                enabled: boolean;
                            };
                            twitter: {
                                name: string;
                                enabled: boolean;
                            };
                            passwordless: {
                                name: string;
                                enabled: boolean;
                            };
                        };
                    };
                    torus: {
                        label: string;
                        enabled: boolean;
                        loginMethods: {
                            name: string;
                            enabled: boolean;
                        };
                    };
                };
                web3Auth: {
                    network: string;
                    clientId: string;
                };
            };
            tezos: {
                beacon: {};
                web3Auth: {
                    network: string;
                    clientId: string;
                };
            };
        };
        versions: ({
            version: string;
            date: string;
            pagesComingSoon: {
                "/page1": {
                    enabled: boolean;
                    title: string;
                    text: string;
                };
                "/page2": {
                    enabled: boolean;
                    title: string;
                    text: string;
                };
            };
        } | {
            version: string;
            date: string;
            pagesComingSoon: {
                "/page2": {
                    enabled: boolean;
                    title: string;
                    text: string;
                };
                "/page1"?: never;
            };
        } | {
            version: string;
            date: string;
            pagesComingSoon: {
                "/page1"?: never;
                "/page2"?: never;
            };
        })[];
        defaultPhase: number;
        phases: {
            name: string;
            label: string;
            index: number;
            attrs: {
                vesting: string;
                typeOfFundraising: string;
                hardCap: string;
            };
        }[];
        api: {
            rootUrl: string;
            back: string;
            coingecko: string;
            binance: string;
        };
        sentry: {
            enabled: boolean;
            dsn: string;
        };
    };
    private setConfig;
}
