const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const { getTokenFixed } = require("./getTokenFixed.js");
const { getScreen } = require("./getScreen.js");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Store hash temporarily in memory
let tempHash = '';

// Integrated getToken function with hash parameter
const getToken = async (req, res) => {
  try {
    if (!tempHash) {
      console.error('Hash is missing');
      return res.status(400).json({ error: 'Hash is missing' });
    }

    console.log('Launching Puppeteer...');
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

    const page = await browser.newPage();
    let authToken = null;

    console.log('Listening for requests...');
    page.on('request', request => {
      if (request.url() === 'https://api.hamsterkombatgame.io/clicker/sync') {
        const headers = request.headers();
        authToken = headers['authorization'] || null;
        console.log('Authorization token captured:', authToken);
      }
    });

    console.log(`Navigating to https://api.hamsterkombatgame.io/clicker/#${tempHash}`);
    await page.goto(`https://api.hamsterkombatgame.io/clicker/#${tempHash}`, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Waiting for specific request...');
    await page.waitForRequest(request => request.url() === 'https://api.hamsterkombatgame.io/clicker/sync', { timeout: 60000 });

    console.log('Closing browser...');
    await browser.close();

    if (!authToken) {
      console.error('No token found');
      return res.status(404).json({ token: 'No token found' });
    }

    res.json({ token: authToken });
  } catch (error) {
    console.error('Error running Puppeteer script:', error);
    if (error instanceof puppeteer.errors.TimeoutError) {
      return res.status(500).json({ error: 'Timeout while trying to fetch the token.' });
    } else {
      return res.status(500).json({ error: 'Error running Puppeteer script' });
    }
  }
};


// Handle POST requests to /get-query
const getQuery = (req, res) => {
  const hash = req.body.hash || '';
  tempHash = hash;

  // Send the hash value in the response
  res.send(`Hash: ${hash}`);
};

// Define routes
app.post('/get-query', getQuery);
app.post('/get-token', getToken);

app.get('/', (req, res) => {
  res.send('Render Puppeteer server is up and running!');
});

app.get('/get-token', (req, res) => {
  getToken(req, res);
});

app.get('/get', (req, res) => {
  // Ensure getScreen function is properly defined elsewhere
  getScreen(res);
});

app.get('/get-token-fixed', (req, res) => {
  // Ensure getTokenFixed function is properly defined elsewhere
  getTokenFixed(res);
});

app.get('/query', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'query.html'));
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
