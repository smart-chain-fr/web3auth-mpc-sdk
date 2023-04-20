"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
class EthereumRpc {
    constructor(provider) {
        this.provider = provider;
    }
    getChainId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ethersProvider = new ethers_1.ethers.providers.Web3Provider(this.provider);
                const networkDetails = yield (ethersProvider.getNetwork());
                return networkDetails.chainId;
            }
            catch (error) {
                return error;
            }
        });
    }
    getAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ethersProvider = new ethers_1.ethers.providers.Web3Provider(this.provider);
                const signer = ethersProvider.getSigner();
                const address = yield signer.getAddress();
                return address;
            }
            catch (error) {
                return error;
            }
        });
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ethersProvider = new ethers_1.ethers.providers.Web3Provider(this.provider);
                const signer = ethersProvider.getSigner();
                const address = (yield signer.getAddress());
                const balance = ethers_1.ethers.utils.formatEther(yield ethersProvider.getBalance(address));
                return balance;
            }
            catch (error) {
                return error;
            }
        });
    }
    sendTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ethersProvider = new ethers_1.ethers.providers.Web3Provider(this.provider);
                const signer = ethersProvider.getSigner();
                const destination = "0x40e1c367Eca34250cAF1bc8330E9EddfD403fC56";
                const amount = ethers_1.ethers.utils.parseEther("0.001");
                const tx = yield signer.sendTransaction({
                    to: destination,
                    value: amount,
                    chainId: 80001,
                });
                const receipt = yield tx.wait();
                return receipt;
            }
            catch (error) {
                return error;
            }
        });
    }
    signMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ethersProvider = new ethers_1.ethers.providers.Web3Provider(this.provider);
                const signer = ethersProvider.getSigner();
                const originalMessage = "YOUR_MESSAGE";
                const signedMessage = yield signer.signMessage(originalMessage);
                return signedMessage;
            }
            catch (error) {
                return error;
            }
        });
    }
    getPrivateKey() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const privateKey = yield this.provider.request({
                    method: "eth_private_key",
                });
                return privateKey;
            }
            catch (error) {
                return error;
            }
        });
    }
}
exports.default = EthereumRpc;
