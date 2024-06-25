import Web3 from 'web3';

class WalletManager {
    constructor() {
        this.web3 = null;
        this.userAddress = null;
    }

    async connect() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.web3 = new Web3(window.ethereum);
                const accounts = await this.web3.eth.getAccounts();
                this.userAddress = accounts[0];
                console.log('Wallet connected:', this.userAddress);
                return true;
            } catch (error) {
                console.error("Failed to connect wallet:", error);
                return false;
            }
        } else {
            console.error("Ethereum wallet not detected");
            alert("Please install MetaMask or another Ethereum wallet to play this game.");
            return false;
        }
    }

    getUserAddress() {
        return this.userAddress;
    }
}

export default WalletManager;