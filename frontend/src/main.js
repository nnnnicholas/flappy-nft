import Phaser from 'phaser';
import WalletManager from './wallet.js';
import NFTManager from './nft.js';
import FlappyNFT from './game.js';

const walletManager = new WalletManager();
const nftManager = new NFTManager(walletManager);

function showLoadingMessage(message) {
    const loadingMessage = document.getElementById('loading-message') || document.createElement('div');
    loadingMessage.id = 'loading-message';
    loadingMessage.style.position = 'fixed';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.fontSize = '24px';
    loadingMessage.style.backgroundColor = 'rgba(0,0,0,0.7)';
    loadingMessage.style.color = 'white';
    loadingMessage.style.padding = '20px';
    loadingMessage.style.borderRadius = '10px';
    loadingMessage.style.zIndex = '1000';
    loadingMessage.textContent = message;
    document.body.appendChild(loadingMessage);
}

function hideLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        document.body.removeChild(loadingMessage);
    }
}

async function startGame() {
    try {
        showLoadingMessage('Connecting wallet...');
        const walletConnected = await walletManager.connect();
        if (!walletConnected) {
            throw new Error("Failed to connect wallet. Please try again.");
        }

        showLoadingMessage('Fetching your NFTs...');
        await nftManager.fetchNFTs();
        hideLoadingMessage();

        const selectedNFT = await nftManager.selectNFT();

        showLoadingMessage('Loading game...');
        const nftImage = new Image();
        nftImage.src = selectedNFT.image_url;
        
        nftImage.onload = () => {
            hideLoadingMessage();
            const config = {
                type: Phaser.AUTO,
                width: window.innerWidth,
                height: window.innerHeight,
                parent: 'game-container',
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 300 },
                        debug: false
                    }
                },
                scene: FlappyNFT
            };

            const game = new Phaser.Game(config);
            game.scene.start('FlappyNFT', { nftImage: selectedNFT.image_url });

            window.addEventListener('resize', () => {
                game.scale.resize(window.innerWidth, window.innerHeight);
            });
        };

        nftImage.onerror = () => {
            throw new Error("Failed to load the NFT image. Please try again.");
        };
    } catch (error) {
        console.error("Game error:", error);
        hideLoadingMessage();
        alert(error.message);
    }
}

startGame();