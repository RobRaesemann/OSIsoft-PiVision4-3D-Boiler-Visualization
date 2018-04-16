const execSync = require('child_process').execSync;

const fs = require('fs');

if (!fs.existsSync('./ssl/openssl.conf')) {
  throw new Error('Could not find "./ssl/openssl.conf"');
}

const cmds = [
  // Create SSL private key localhost.key and SSL Certificate Signing Request(CSR) with Common Name localhost
  'openssl req -newkey rsa:2048 -nodes -keyout ./ssl/localhost.key -out ./ssl/localhost.csr -subj "/CN=localhost"',
  // Sign the CSR with private key and configure Subject Alternative Name
  'openssl x509 -signkey ./ssl/localhost.key -in ./ssl/localhost.csr -req -days 3650 -out ./ssl/localhost.crt -extfile ./ssl/openssl.conf'
];

cmds.forEach(function (cmd) {
  execSync(cmd, { stdio: 'inherit' });
});
