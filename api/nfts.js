const axios = require('axios');

module.exports = async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Ethereum address is required' });
  }

  try {
    const response = await axios.get(`https://api.opensea.io/v2/chain/ethereum/account/${address}/nfts`, {
      headers: {
        'X-API-KEY': process.env.OPENSEA_API_KEY,
        'Accept': 'application/json'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching NFTs:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch NFTs', details: error.response ? error.response.data : error.message });
  }
};