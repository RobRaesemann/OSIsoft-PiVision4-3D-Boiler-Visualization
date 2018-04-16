const os = require('os');
const platform = os.platform(); // equivalent to process.platform
const execSync = require('child_process').execSync;
const fs = require('fs');

if (!fs.existsSync('./ssl/localhost.crt')) {
  throw new Error('Could not find "./ssl/localhost.crt"');
}

if (platform === 'win32') { // windows
  const cmds = [
    // Add new certificate to Trusted Root Certification Authorities
    'certutil -addstore Root "./ssl/localhost.crt"'
  ];

  cmds.forEach(function (cmd) {
    execSync(cmd, { stdio: 'inherit' });
  });

} else if (platform === 'darwin') { // mac
  const cmds = [
    // Add new certificate to Trusted Root Certification Authorities
    'sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ./ssl/localhost.crt'
  ];

  cmds.forEach(function (cmd) {
    execSync(cmd, { stdio: 'inherit' });
  });
} else {
  throw new Error('Unsupported operating system');
}
