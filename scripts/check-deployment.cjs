const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const url = new URL(process.argv[2] || JSON.parse(fs.readFileSync(path.join(root,'publication.json'))).url);
assert.equal(url.protocol, 'https:', 'The public page must use HTTPS');
if (!url.pathname.endsWith('/')) url.pathname += '/';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
async function check() {
  const page = await fetch(url,{signal:AbortSignal.timeout(20000),cache:'no-store'});
  assert(page.ok, `Page HTTP ${page.status}`);
  assert.equal(new URL(page.url).protocol,'https:');
  assert.match(page.headers.get('content-type') || '',/text\/html/i);
  assert.match(await page.text(),/rel="ar"/);
  const expected = [
    ['model.usdz','model/vnd.usdz+zip'], ['preview.png','image/png'],
    ['qr-code.svg','image/svg+xml'], ['app.js',null], ['styles.css','text/css'],
    ['vendor/qrcode.js',null]
  ];
  for (const [file,mime] of expected) {
    const response = await fetch(new URL(file,url),{signal:AbortSignal.timeout(20000),cache:'no-store'});
    assert(response.ok, `${file}: HTTP ${response.status}`);
    assert.equal(new URL(response.url).protocol,'https:',`${file}: HTTPS required`);
    if (mime) assert.equal((response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase(),mime,`${file}: wrong MIME type`);
    const data = Buffer.from(await response.arrayBuffer());
    // Verify that the published bytes match this build, not a cached older model/QR.
    assert.equal(hash(data),hash(fs.readFileSync(path.join(root,file))),`${file}: differs from this build`);
    console.log(`OK ${file}: ${data.length} bytes${mime ? ', ' + mime : ''}`);
  }
  const publication = await fetch(new URL('publication.json',url),{signal:AbortSignal.timeout(20000),cache:'no-store'});
  assert(publication.ok);
  assert.equal((await publication.json()).url,url.href,'QR publication URL mismatch');
  console.log('HTTPS, assets, MIME, and publication URL verified:',url.href);
}
(async () => {
  const attempts = process.env.CI ? 8 : 1;
  for (let i=0;i<attempts;i++) {
    try { await check(); return; }
    catch (error) {
      if (i===attempts-1) throw error;
      console.log(`Waiting for Pages CDN (${i+1}/${attempts}): ${error.message}`);
      await new Promise(resolve => setTimeout(resolve,10000));
    }
  }
})().catch(error => { console.error(error.message); process.exitCode=1; });
