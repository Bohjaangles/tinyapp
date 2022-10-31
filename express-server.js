// PRE CONFIG
const express = require('express');
const app = express();
const port = 8080;

const urLDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});

app.listen(port, () => {
  console.log(`you are listening on port ${port}`);
});