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
            res.json(response.data);
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