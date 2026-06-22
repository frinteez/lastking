(async () => {
  const puppeteer = (await import('puppeteer')).default;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to game...');
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log(e));
  
  console.log('Waiting 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));
  
  await browser.close();
  console.log('Done.');
})();
