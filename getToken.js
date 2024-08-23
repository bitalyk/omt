const puppeteer = require('puppeteer');
require("dotenv").config();

const getToken = async (req, res) => {
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


    const savedFragment = localStorage.getItem('savedFragment');
    console.log('Saved Fragment:', savedFragment);

    function showSavedFragment() {
    // Retrieve the saved fragment from local storage
    const savedFragment = localStorage.getItem('savedFragment');

    // Check if there's any value saved in local storage
    if (savedFragment) {
        console.log('Saved Fragment:', savedFragment);
    } else {
        console.log('No saved fragment found.');
    }
}

    // Replace the query string in the URL
    const targetUrl = 'https://hamsterkombatgame.io/clicker/' + savedFragment;

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

    // Navigate to the dynamically constructed URL
    await page.goto(targetUrl);

    // Wait for the specific request
    await page.waitForRequest(request => request.url() === 'https://api.hamsterkombatgame.io/clicker/sync');
    
    // Close the browser
    await browser.close();

    // Send the captured token or a message indicating no token was found
    res.json({ token: authToken || 'No token found' });
  } catch (error) {
    console.error('Error running Puppeteer script:', error);
    res.status(500).send('Error running Puppeteer script');
  }
};

module.exports = { getToken };
