const express = require('express');
const path = require('path');
const compression = require('compression');
const libName = require('./package.json').name;
const camelCase = require('camelcase');
const app = express();
const networkInterfaces = require('os').networkInterfaces;
const build = require('./build');
let server;

const https = require('https');
const fs = require('fs');
const config = require('./server-config.json');

const options = {
    key: fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert),
    requestCert: false,
    rejectUnauthorized: false
};

app.use(compression());

app.use((req, res, next) => {
  const reqOrigin = req.header('Origin');
  if (reqOrigin && config.cors.origin === '*' || config.cors.origin.includes(reqOrigin)) {
    res.header("Access-Control-Allow-Origin", reqOrigin);
    res.header('Access-Control-Allow-Credentials', config.cors.credentials);
    if (req.method === 'OPTIONS') {
      res.header("Access-Control-Allow-Headers", config.cors.headers);
      res.header('Access-Control-Allow-Methods', config.cors.methods);
      res.sendStatus(200);
    }
  }
  next();
});

app.use('/', express.static(path.join(__dirname, 'dist')));

app.get('/manifest', (req, res) => {
  const { address, port } = server.address();
  res.json({
    extensions: [{
      name: camelCase(libName),
      path: `https://${address}:${port}/${libName}.js`
    }]
  });
});

build.start().then(() => {
  server = https.createServer(options, app);
  server.listen(config.port, config.hostname, () => {
    const { address, port } = server.address();
    console.log('Listening on %s:%s', address, port);
  });
});
