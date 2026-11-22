const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = path.resolve(__dirname, '..');
const pagesDir = path.join(workspaceRoot, 'docs');
const indexPath = path.join(pagesDir, 'index.html');
const notFoundPath = path.join(pagesDir, '404.html');
const noJekyllPath = path.join(pagesDir, '.nojekyll');
const legacyBrowserDir = path.join(pagesDir, 'browser');
const expectedBaseHref = '/portfolio/';

function fail(message) {
  console.error(`Pages preparation failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  fail('docs/index.html nao foi gerado. Execute "npm run build:pages" antes da preparacao.');
}

const indexHtml = fs.readFileSync(indexPath, 'utf8');

if (!indexHtml.includes(`<base href="${expectedBaseHref}">`)) {
  fail(`docs/index.html precisa usar base href "${expectedBaseHref}".`);
}

const scriptSources = Array.from(indexHtml.matchAll(/<script[^>]+src="([^"]+)"/g), ([, source]) => source);
const stylesheetSources = Array.from(indexHtml.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g), ([, source]) => source);
const missingAssets = [...scriptSources, ...stylesheetSources]
  .map(source => source.split('?')[0])
  .filter(source => source && !source.startsWith('http://') && !source.startsWith('https://'))
  .filter(source => !fs.existsSync(path.join(pagesDir, source)));

if (missingAssets.length > 0) {
  fail(`assets referenciados nao encontrados: ${missingAssets.join(', ')}`);
}

if (fs.existsSync(legacyBrowserDir)) {
  fs.rmSync(legacyBrowserDir, { recursive: true, force: true });
}

// Com pré-renderização, index.html traz a página inicial pronta; rotas só-navegador
// (admin, URLs desconhecidas) precisam da casca vazia index.csr.html no 404.
const csrPath = path.join(pagesDir, 'index.csr.html');
fs.writeFileSync(notFoundPath, fs.existsSync(csrPath) ? fs.readFileSync(csrPath, 'utf8') : indexHtml);
fs.writeFileSync(noJekyllPath, '\n');

console.log('GitHub Pages bundle preparado em docs/.');
