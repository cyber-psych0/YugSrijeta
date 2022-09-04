const http = require('http');
const app = require('./app');

const server = http.createServer(app);

server.listen(8800, () => {
    console.log("Backend server is running!");
});