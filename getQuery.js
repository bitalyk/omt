const puppeteer = require('puppeteer');

const getQuery = async (req, res) => {
  try {
    const query = req.query.query; // Extract the 'query' parameter from the request

    if (!query) {
      return res.status(400).send('Missing query parameter');
    }

    // Log the query parameter to the console
    console.log('Received query:', query);

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
    await page.goto(`https://example.com?query=${encodeURIComponent(query)}`); // Use the query parameter in the URL

    // Perform any additional operations with Puppeteer here

    await browser.close();
    res.send('Puppeteer script completed successfully: ${encodeURIComponent(query)');
  } catch (error) {
    console.error('Error running Puppeteer script:', error);
    res.status(500).send('Error running Puppeteer script');
  }
};

module.exports = { getQuery };