const express = require("express");
const { getToken } = require("./getToken.js");
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
    res.send("Render Puppeteer server is up and running!");
  });

app.get("/get-token", (req, res) => {
    getToken(res);
  });

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });