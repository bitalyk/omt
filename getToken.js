const puppeteer = require('puppeteer');
require("dotenv").config();

const getToken = async (req,res) => {
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
    let authToken = null;
    
    // Listen to requests to capture the authorization token
    page.on('request', request => {
      const url = request.url();
      if (url === 'https://api.hamsterkombatgame.io/clicker/sync') {
        const headers = request.headers();
        if (headers['authorization']) {
          authToken = headers['authorization'];
        }
      }
    });

    // Navigate to the specified URL
    await page.goto('https://api.hamsterkombatgame.io/clicker/#'+window.location.hash);

    // Wait for the specific request
    await page.waitForRequest(request => request.url() === 'https://api.hamsterkombatgame.io/clicker/sync');
    
    // Close the browser
    await browser.close();

    // Send the captured token or a message indicating no token was found
    res.json({ token: authToken || 'No token found' });
  } catch (error) {
    console.error('Error running Puppeteer script:', error);
  }
};

module.exports = { getToken };
