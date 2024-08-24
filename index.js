const express = require("express");
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const { getToken } = require("./getToken.js");
const { getQuery } = require("./getQuery.js");
const { getTokenFixed } = require("./getTokenFixed.js");
const { getScreen } = require("./getScreen.js");
const app = express();

const getQuary = (req, res) => {
  // Extract the hash from the request body
  const hash = req.body.hash || '';

  // Log the hash value
  console.log(`Hash: ${hash}`);

  // Send the hash value in the response
  res.send(`Hash: ${hash}`);
};

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/get-quary', getQuary);

const PORT = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.send("Render Puppeteer server is up and running!");
  });

app.get("/get-token", (req, res) => {
    getToken(req,res);
  });

  app.post("/get-query", (req, res) => {
    getQuery(req,res);
  });

app.get("/get", (req, res) => {
    getScreen(res);
  });

app.get("/get-token-fixed", (req, res) => {
    getTokenFixed(res);
  });

  app.get('/query', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'query.html'));
  });

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });