import config from '../config.js';

class NFTManager {
    constructor(walletManager) {
        this.walletManager = walletManager;
        this.nfts = [];
    }

    async fetchNFTs() {
        const address = this.walletManager.getUserAddress();
        try {
            const response = await fetch(`${config.API_URL}?address=${address}`);
            if (!response.ok) {
                throw new Error('Failed to fetch NFTs');
            }
            const data = await response.json();
            
            this.nfts = data.nfts
                .filter(nft => nft.image_url)
                .slice(0, 10);

            return this.nfts;
        } catch (error) {
            console.error("Failed to fetch NFTs:", error);
            throw error;
        }
    }

    async selectNFT() {
        return new Promise((resolve) => {
            const container = document.createElement('div');
            container.id = 'nft-selection';
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.backgroundColor = 'rgba(0,0,0,0.8)';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            container.style.zIndex = '1000';

            const title = document.createElement('h2');
            title.textContent = 'Select your NFT';
            title.style.color = 'white';
            container.appendChild(title);

            const nftList = document.createElement('div'); // Define nftList here
            nftList.style.display = 'flex';
            nftList.style.flexWrap = 'wrap';
            nftList.style.justifyContent = 'center';
            nftList.style.maxWidth = '80%';
            nftList.style.maxHeight = '70vh';
            nftList.style.overflowY = 'auto';

            this.nfts.forEach(nft => {
                const nftElement = document.createElement('div');
                nftElement.style.margin = '10px';
                nftElement.style.cursor = 'pointer';
                nftElement.style.textAlign = 'center';

                const img = document.createElement('img');
                img.src = nft.image_url;
                img.alt = nft.name;
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.objectFit = 'cover';

                const name = document.createElement('p');
                name.textContent = nft.name;
                name.style.color = 'white';
                name.style.marginTop = '5px';

                nftElement.appendChild(img);
                nftElement.appendChild(name);

                nftElement.onclick = () => {
                    document.body.removeChild(container);
                    resolve(nft);
                };

                nftList.appendChild(nftElement);
            });

            container.appendChild(nftList);
            document.body.appendChild(container);
        });
    }
}

export default NFTManager;