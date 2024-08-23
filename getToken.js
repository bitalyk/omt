const puppeteer = require('puppeteer');
require('dotenv').config();
const querystring = require('querystring');

const getToken = async (req, res) => {
  try {
    // Extract the query string from the request URL
    const query = req.query.query;
    
    // Decode the query string
    const decodedQuery = decodeURIComponent(query);
    
    // Log the decoded query for debugging
    console.log('Decoded Query:', decodedQuery);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: [
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--single-process',
        '--no-zygote',
      ],
      executablePath: process.env.NODE_ENV === 'production'
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    let authToken = null;

    // Construct the target URL with the decoded query string
    const targetUrl = 'https://hamsterkombatgame.io/clicker/' + decodedQuery;

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

    // Send the decoded query and token in the response
    res.json({
      decodedQuery: decodedQuery,
      token: authToken || 'No token found'
    });
  } catch (error) {
    console.error('Error running Puppeteer script:', error);
    res.status(500).send('Error running Puppeteer script');
  }
};

module.exports = { getToken };
