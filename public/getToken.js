const puppeteer = require('puppeteer');

const getToken = async (req,res) => {
  try {
    // Launch the browser with specific arguments and executable path
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath: process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    });
    const fragment = window.location.hash.substring(1);
    const page = await browser.newPage();
    let authToken = null;
    
    // Construct the target URL
    const targetUrl = `https://hamsterkombatgame.io/clicker/${fragment}`;

    // Listen to requests to capture the authorization token
    page.on('request', (request) => {
      const reqUrl = request.url();
      if (reqUrl === 'https://api.hamsterkombatgame.io/clicker/sync') {
        const headers = request.headers();
        if (headers['authorization']) {
          authToken = headers['authorization'];
        }
      }
    });

    // Navigate to the constructed URL
    await page.goto(targetUrl);

    // Wait for the specific request to ensure the token is captured
    await page.waitForRequest((request) => request.url() === 'https://api.hamsterkombatgame.io/clicker/sync');
    
    // Close the browser
    await browser.close();

    // Log the captured token or indicate no token was found
    console.log({ token: authToken || 'No token found' });
  } catch (error) {
    console.error('Error running Puppeteer script:', error);
  }
};