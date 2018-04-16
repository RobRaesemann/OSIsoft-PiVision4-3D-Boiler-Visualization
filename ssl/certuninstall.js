const os = require('os');
const platform = os.platform(); // equivalent to process.platform
const execSync = require('child_process').execSync;

if (platform === 'win32') { // windows
  const cmds = [
    // Delete old localhost certificate from Trusted Root Certification Authorities using certID
    'certutil -delstore Root "‎localhost"',
  ];

  cmds.forEach(function (cmd) {
    execSync(cmd, { stdio: 'inherit' });
  });
} else if (platform === 'darwin') { // mac
  const cmds = [
    // Delete old localhost certificate from Trusted Root Certification Authorities
    'sudo security delete-certificate -c localhost /Library/Keychains/System.keychain'
  ];

  cmds.forEach(function (cmd) {
    execSync(cmd, { stdio: 'inherit' });
  });
} else {
  throw new Error('Unsupported operating system');
}
