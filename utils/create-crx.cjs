/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const crx3 = require('crx3');
const packageJson = require('../package.json');
const { name, version } = packageJson;

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist', 'chrome');
const releasesDir = path.join(rootDir, 'releases');
const keyPath = path.join(rootDir, 'dist.pem');

if (!fs.existsSync(path.join(distDir, 'manifest.json'))) {
  console.error('error: dist/chrome/manifest.json missing — run pnpm build first');
  process.exit(1);
}

if (!fs.existsSync(keyPath)) {
  console.error('error: dist.pem not found (CRX signing key). Generate once:');
  console.error('  openssl genrsa -out dist.pem 2048');
  console.error('Do not commit dist.pem. Chrome Web Store install uses the zip, not the crx.');
  process.exit(1);
}

if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
}

const crxPath = path.join(releasesDir, `${name}_v${version}.crx`);

crx3([`${distDir}/manifest.json`], {
  keyPath,
  crxPath,
})
  .then(() => {
    console.log(`created: ${crxPath}`);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
