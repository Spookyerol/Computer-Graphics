const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.static(__dirname + '/src'));

app.get('/', function (req, res) {
    res.sendFile('index.html', { root: './src' });
});

console.log("Server ready");
server.listen(3000)