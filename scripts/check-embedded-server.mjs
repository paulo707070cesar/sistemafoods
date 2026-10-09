// Verifica o modo "servidor embutido" usado pelo aplicativo desktop:
// importação do módulo, porta automática e entrega da interface por HTTP.
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const mod = await import(pathToFileURL(path.join(process.cwd(), 'server.js')).href);
const started = await mod.startServer(0, '0.0.0.0');
const base = `http://127.0.0.1:${started.port}`;

console.log(`PORTA_ATRIBUIDA=${started.port}`);

const page = await fetch(`${base}/`);
const html = await page.text();
console.log(`HOME=${page.status} temRoot=${html.includes('id="root"')}`);

const bundleMatch = html.match(/assets\/index-[^"]+\.js/);
console.log(`BUNDLE=${bundleMatch ? bundleMatch[0] : 'ausente'}`);

if (bundleMatch) {
  const asset = await fetch(`${base}/${bundleMatch[0]}`);
  const bytes = (await asset.arrayBuffer()).byteLength;
  console.log(`ASSET=${asset.status} bytes=${bytes}`);
}

const spa = await fetch(`${base}/rota-interna`);
console.log(`SPA_FALLBACK=${spa.status} tipo=${spa.headers.get('content-type')}`);

const health = await fetch(`${base}/api/health`);
const healthBody = await health.json();
console.log(`HEALTH=${health.status} db=${healthBody.database} auth=${healthBody.authConfigured}`);

const csp = page.headers.get('content-security-policy');
console.log(`CSP=${csp ? 'presente' : 'ausente'}`);

await new Promise(resolve => started.server.close(resolve));
mod.closeDatabase();
console.log('ENCERRADO=ok');
