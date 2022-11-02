// PRE CONFIG
const express = require('express');
const app = express();
const port = 8080;
const cookieParser = require('cookie-parser');
const { signedCookie } = require('cookie-parser');

app.set('view engine', 'ejs');

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/login', (req, res) => {
  // req.body is already an object here>>> {username: 'whateveristypedinthesubmissionbox'}
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] }; 
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let temp = generateRandomString();
  urlDatabase[temp] = req.body.longURL; 
  res.redirect(`/urls/${temp}`); 
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]; 
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL; 
  res.redirect('/urls');
});

app.get(`/u/:id`, (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.listen(port, () => {
  console.log(`you are listening on port ${port}`);
});