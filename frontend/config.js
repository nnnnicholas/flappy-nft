const config = {
    API_URL: (typeof process !== 'undefined' && process.env.API_URL) || 'http://localhost:3000/api/nfts',
};

export default config;