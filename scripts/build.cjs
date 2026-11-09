// No npm install required. Node.js 20+.
const fs = require('node:fs');
const path = require('node:path');
const qrcode = require('../vendor/qrcode.js');
const root = path.resolve(__dirname, '..');
const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/build.cjs https://OWNER.github.io/REPO/ [output-directory]');
const url = new URL(input);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
  throw new Error('Expected a public HTTPS page URL without credentials, query, or fragment.');
}
if (!url.pathname.endsWith('/')) url.pathname += '/';
const qr = qrcode(0, 'M');
qr.addData(url.href, 'Byte'); qr.make();
const svg = qr.createSvgTag({cellSize:6, margin:24, scalable:true, alt:'QR code: ' + url.href});
const files = ['index.html','styles.css','app.js','icon.svg','model.usdz','preview.png','README.md','THIRD_PARTY_NOTICES.md','.nojekyll'];
const destination = process.argv[3] ? path.resolve(process.argv[3]) : root;
fs.mkdirSync(destination, {recursive:true});
if (destination !== root) {
  for (const file of files) fs.copyFileSync(path.join(root,file), path.join(destination,file));
  fs.cpSync(path.join(root,'vendor'), path.join(destination,'vendor'), {recursive:true});
}
fs.writeFileSync(path.join(destination,'qr-code.svg'), svg + '\n');
fs.writeFileSync(path.join(destination,'publication.json'), JSON.stringify({url:url.href}, null, 2) + '\n');
console.log('Ready:', destination);
console.log('QR target:', url.href);
