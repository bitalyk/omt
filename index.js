const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const { getTokenFixed } = require("./getTokenFixed.js");
const { getScreen } = require("./getScreen.js");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Store hash temporarily in memory (or use a more robust method if needed)
let tempHash = '';


// Integrated getToken function with hash parameter
const getToken = async (req, res) => {
  try {
    const hash = tempHash; // Use the stored hash

    if (!hash) {
      return res.status(400).send('Hash is missing');
    }

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

    // Navigate to the specified URL with hash
    await page.goto(`https://api.hamsterkombatgame.io/clicker/#${hash}`);

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

// Handle POST requests to /get-query
const getQuery = (req, res) => {
  // Extract the hash from the request body
  const hash = req.body.hash || '';

  // Log the hash value
  console.log(`Hash: ${hash}`);

  let tempHash = hash;

  // Send the hash value in the response
  res.send(`Hash: ${hash}`);
};

// Define routes
app.post('/get-query', getQuery);

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
