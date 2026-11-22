const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

// Primeiro navegador Chromium disponível na máquina.
const CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

(async () => {
  const executablePath = CANDIDATES.find(p => p && fs.existsSync(p));
  if (!executablePath) {
    console.error('Nenhum Chrome/Edge encontrado. Caminhos testados:\n' + CANDIDATES.filter(Boolean).join('\n'));
    process.exit(1);
  }

  const htmlFile = path.resolve(__dirname, process.env.RESUME_IN || 'resume.html');
  const outputPdf = process.env.RESUME_OUT || path.resolve(__dirname, '..', 'public', 'curriculo-elias-gomes.pdf');
  const html = fs.readFileSync(htmlFile, 'utf-8');

  console.log(`Gerando PDF via ${path.basename(executablePath)}...`);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
  // Garante que a webfont terminou de carregar antes de paginar.
  await page.evaluateHandle('document.fonts.ready');

  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  const kb = (fs.statSync(outputPdf).size / 1024).toFixed(0);
  console.log(`PDF gerado: ${outputPdf} (${kb} KB)`);
})();
