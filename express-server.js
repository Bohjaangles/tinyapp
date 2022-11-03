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

 //
 // DATABASE
 //

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

};

//
// MIDDLEWARE
//

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//
// ALL THE ROUTES
//

app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, users: req.params.id };
  return res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  let temp = generateRandomString();
  users[temp] = { id: temp, email: req.body.email, password: req.body.password}
  res.cookie('user_id', temp);
  return res.redirect('/urls');
});

app.post('/login', (req, res) => {
  console.log(req.body.id, 'line 51');
  res.cookie('id', req.body.id); // make a cookie,called logged in, that lets them do whatever if their id matches expected
  return res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('id');
  return res.redirect('/urls');
})

app.get('/', (req, res) => {
  return res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, users: req.params.id }; 
  console.log(templateVars.id, 'line 67');
  return res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {  users: req.params.id };
  return res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let temp = generateRandomString();
  urlDatabase[temp] = req.body.longURL; 
  return res.redirect(`/urls/${temp}`); 
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { users: req.params.id, longURL: urlDatabase[req.params.id]};
  return res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]; 
  return res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL; 
  return res.redirect('/urls');
});

app.get(`/u/:id`, (req, res) => {
  const longURL = urlDatabase[req.params.id];
  return res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  return res.json(urlDatabase);
});

//
// IT LISTENS...
//

app.listen(port, () => {
  console.log(`you are listening on port ${port}`);
});