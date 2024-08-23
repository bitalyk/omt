const puppeteer = require('puppeteer');
require("dotenv").config();

const getScreen = async (res) => {
  try {
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

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

module.exports = { getScreen };
