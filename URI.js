const isDevelopmentMode = process.env.MODE === 'DEV';

const clientURL = isDevelopmentMode ? 'http://localhost:4000' : ['https://touch-server.onrender.com'];

module.exports = { clientURL };
