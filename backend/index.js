const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

async function getFloorPrice(collectionSlug) {
    try {
        const response = await axios.get(`https://api.opensea.io/api/v2/collections/${collectionSlug}/stats`, {
            headers: {
                'X-API-KEY': process.env.OPENSEA_API_KEY
            }
        });
        return response.data.total.floor_price;
    } catch (error) {
        console.error(`Error fetching floor price for ${collectionSlug}:`, error.message);
        return null;
    }
}

app.get('/api/nfts', async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.status(400).json({ error: 'Ethereum address is required' });
    }

    if (!ethers.isAddress(address)) {
        return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    try {
        console.log('Fetching NFTs for address:', address);
        const response = await axios.get(`https://api.opensea.io/v2/chain/ethereum/account/${address}/nfts`, {
            headers: {
                'X-API-KEY': process.env.OPENSEA_API_KEY,
                'Accept': 'application/json'
            }
        });

        console.log('OpenSea API Response Status:', response.status);
        console.log('OpenSea API Response Headers:', response.headers);
        console.log('OpenSea API Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.nfts) {
            // Fetch floor prices for each unique collection
            const uniqueCollections = [...new Set(response.data.nfts.map(nft => nft.collection))];
            const floorPrices = await Promise.all(
                uniqueCollections.map(async (collection) => {
                    const floorPrice = await getFloorPrice(collection);
                    return { collection, floorPrice };
                })
            );

            // Create a map for quick lookup
            const floorPriceMap = Object.fromEntries(floorPrices.map(({ collection, floorPrice }) => [collection, floorPrice]));

            // Add floor price to each NFT
            const nftsWithFloorPrice = response.data.nfts.map(nft => ({
                ...nft,
                floor_price: floorPriceMap[nft.collection] || null
            }));

            res.json({ nfts: nftsWithFloorPrice });
        } else {
            throw new Error('Invalid response from OpenSea API');
        }
    } catch (error) {
        console.error('Error fetching NFTs:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch NFTs', details: error.response ? error.response.data : error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
    console.log('Note: In a production environment, always use HTTPS!');
});