const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const htmlFile = path.resolve(__dirname, 'resume.html');
  const outputPdf = path.resolve(__dirname, '..', 'public', 'curriculo-elias-gomes.pdf');
  const photoPath = path.resolve(__dirname, '..', 'public', 'profile.jpg');

  const photoBase64 = fs.readFileSync(photoPath).toString('base64');
  const photoDataUri = `data:image/jpeg;base64,${photoBase64}`;

  let html = fs.readFileSync(htmlFile, 'utf-8');
  html = html.replace('__PHOTO_SRC__', photoDataUri);

  console.log('Iniciando Edge via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

  // Aguarda fonte carregar (Google Fonts)
  await new Promise(r => setTimeout(r, 2000));

  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  console.log(`PDF gerado: ${outputPdf}`);
})();
