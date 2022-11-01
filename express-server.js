// PRE CONFIG
const express = require('express');
const app = express();
const port = 8080;

app.set('view engine', 'ejs');

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  let temp = generateRandomString()
  urlDatabase[temp] = req.body.longURL; // You need to save that generateRandomSring() output to a variable
  res.redirect(`/urls/${temp}`); // Then put your variable here
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get(`/u/:id`, (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b> World</b></body></html>\n');
});

app.listen(port, () => {
  console.log(`you are listening on port ${port}`);
});