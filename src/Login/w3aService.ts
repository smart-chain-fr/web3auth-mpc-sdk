import { SafeEventEmitterProvider } from "@web3auth-mpc/base";
import RPC from "./ethersRPC"; // for using web3.js

// MPC stuff
import { Web3Auth } from "@web3auth-mpc/web3auth";
import { OpenloginAdapter } from "@web3auth-mpc/openlogin-adapter";
import { tssDataCallback, tssGetPublic, tssSign, generatePrecompute } from "torus-mpc";


const clientId = "BHMup7Fr9298T8YP9MZ61bjOHuO_ZYBPSkOfGyialHDWHlEkOuDpHKJ0liGOuNsLLAv_TH45NmxULNMohJrd8Xk"; // get from https://dashboard.web3auth.io

class w3aService {
  web3auth : Web3Auth | null = null;
  provider : SafeEventEmitterProvider | null = null;


		async initEthAuth() {
			try {
				const web3auth = new Web3Auth({
					clientId,
					uiConfig: {
						appLogo: "https://images.web3auth.io/web3auth-logo-w.svg",
						theme: "light",
						loginMethodsOrder: ["twitter", "google"],
					},
					chainConfig: {
						chainNamespace: "eip155",
						chainId: "0x5",
						rpcTarget: "https://rpc.ankr.com/eth_goerli",
						displayName: "Goerli Testnet",
						blockExplorer: "https://goerli.etherscan.io/",
						ticker: "ETH",
						tickerName: "Ethereum",
					},
					enableLogging: true,
				});

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
						clientId,
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
				this.web3auth = web3auth;

				if (web3auth.provider) {
					this.provider = web3auth.provider;
				}
			} catch (error) {
				console.log("error", error);
			}
		};

	async login() {
		if (!this.web3auth) {
			console.log("web3auth not initialized yet");
			return;
		}
		const web3authProvider = await this.web3auth.connect();
		this.provider = web3authProvider;
		generatePrecompute(); // <-- So one precompute would be available to your users.
	};

	async getUserInfo() {
		if (!this.web3auth) {
			console.log("web3auth not initialized yet");
			return;
		}
		const user = await this.web3auth?.getUserInfo();
		console.log(user);
	};

	async logout() {
		if (!this.web3auth) {
			console.log("web3auth not initialized yet");
			return;
		}
		await this.web3auth.logout();
		this.provider = null;
	};

	async getChainId() {
		if (!this.provider) {
			console.log("provider not initialized yet");
			return;
		}
		const rpc = new RPC(this.provider);
		const chainId = await rpc.getChainId();
		console.log(chainId);
	};
  
	async getAccounts() {
    if (!this.provider) {
			console.log("provider not initialized yet");
			return;
		}
		const rpc = new RPC(this.provider);
		const address = await rpc.getAccounts();
		console.log("ETH Address: " + address);
	};

	async getBalance() {
		if (!this.provider) {
			console.log("provider not initialized yet");
			return;
		}
		const rpc = new RPC(this.provider);
		const balance = await rpc.getBalance();
		console.log(balance);
	};

	async signTransaction() {
		if (!this.provider) {
			console.log("provider not initialized yet");
			return;
		}
		const rpc = new RPC(this.provider);
		const receipt = await rpc.signMessage();
		console.log(receipt);
	};

	async sendTransaction() {
		if (!this.provider) {
			console.log("provider not initialized yet");
			return;
		}
		const rpc = new RPC(this.provider);
		const receipt = await rpc.sendTransaction();
		console.log(receipt);
	};

	async signMessage() {
		if (!this.provider) {
			console.log("provider not initialized yet");
			return;
		}
		const rpc = new RPC(this.provider);
		const signedMessage = await rpc.signMessage();
		console.log(signedMessage);
	};

}

export default w3aService;
