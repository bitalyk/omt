const puppeteer = require('puppeteer');

const getToken = async (res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.google.com');

    // Take a screenshot
    const screenshot = await page.screenshot({ type: 'png' });

    await browser.close();

    // Send the screenshot as the response
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': screenshot.length,
    });
    res.end(screenshot);

  } catch (error) {
    console.error('Error taking screenshot:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
};

module.exports = { getToken };
