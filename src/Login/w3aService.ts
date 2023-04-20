import { SafeEventEmitterProvider } from "@web3auth-mpc/base";
import RPC from "./ethersRPC"; // for using web3.js

// MPC stuff
import { Web3Auth, Web3AuthOptions } from "@web3auth-mpc/web3auth";
import { OpenloginAdapter } from "@web3auth-mpc/openlogin-adapter";
import {
  tssDataCallback,
  tssGetPublic,
  tssSign,
  generatePrecompute,
} from "torus-mpc";

export class W3aService {
  private static instance: W3aService;

  private _web3auth: Web3Auth | null = null;
  private _provider: SafeEventEmitterProvider | null = null;

  static getInstance(): W3aService {
    if (this.instance) return this.instance;
    this.instance = new W3aService();
    return this.instance;
  }

  public get web3auth() {
    return this._web3auth;
  }

  public get provider() {
    return this._provider;
  }

  async initEthAuth(web3AuthOptions: Web3AuthOptions) {
    try {
      const web3auth = new Web3Auth(
        web3AuthOptions
        // 	{
        //     clientId,
        //     uiConfig: {
        //       appLogo: "https://images.web3auth.io/web3auth-logo-w.svg",
        //       theme: "light",
        //       loginMethodsOrder: ["twitter", "google"],
        //     },
        //     chainConfig: {
        //       chainNamespace: "eip155",
        //       chainId: "0x5",
        //       rpcTarget: "https://rpc.ankr.com/eth_goerli",
        //       displayName: "Goerli Testnet",
        //       blockExplorer: "https://goerli.etherscan.io/",
        //       ticker: "ETH",
        //       tickerName: "Ethereum",
        //     },
        //     enableLogging: true,
        //   }
      );

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: "mandatory",
        },
        tssSettings: {
          useTSS: true,
          tssGetPublic,
          tssSign,
          tssDataCallback,
        },
        adapterSettings: {
          _iframeUrl: "https://mpc-beta.openlogin.com",
          network: "development",
          clientId: web3AuthOptions.clientId,
        },
      });

      web3auth.configureAdapter(openloginAdapter);
      await web3auth.initModal({
        modalConfig: {
          "torus-evm": {
            label: "Torus Wallet",
            showOnModal: false,
          },
          metamask: {
            label: "Metamask",
            showOnModal: false,
          },
          "wallet-connect-v1": {
            label: "Wallet Connect",
            showOnModal: false,
          },
        },
      });
      this._web3auth = web3auth;

      if (web3auth.provider) {
        this._provider = web3auth.provider;
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  async login() {
    if (!this._web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await this._web3auth.connect();
    this._provider = web3authProvider;
    generatePrecompute(); // <-- So one precompute would be available to your users.
  }

  async getUserInfo() {
    if (!this._web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await this._web3auth?.getUserInfo();
    console.log(user);
  }

  async logout() {
    if (!this._web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await this._web3auth.logout();
    this._provider = null;
  }

  async getChainId() {
    if (!this._provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this._provider);
    const chainId = await rpc.getChainId();
    console.log(chainId);
  }

  async getAccounts() {
    if (!this._provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this._provider);
    const address = await rpc.getAccounts();
    console.log("ETH Address: " + address);
  }

  async getBalance() {
    if (!this._provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this._provider);
    const balance = await rpc.getBalance();
    console.log(balance);
  }

  async signTransaction() {
    if (!this._provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this._provider);
    const receipt = await rpc.signMessage();
    console.log(receipt);
  }

  async sendTransaction() {
    if (!this._provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this._provider);
    const receipt = await rpc.sendTransaction();
    console.log(receipt);
  }

  async signMessage() {
    if (!this._provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(this._provider);
    const signedMessage = await rpc.signMessage();
    console.log(signedMessage);
  }
}

export default W3aService;
