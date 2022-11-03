// PRE CONFIG
const express = require('express');
const app = express();
const port = 8080;
const cookieParser = require('cookie-parser');
const { signedCookie } = require('cookie-parser');
const morgan = require('morgan');

// 
// MISC functions and essentials
//

app.set('view engine', 'ejs');

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

// looks through an object for of users for an object whose email key matches the target email
const getUserByEmail = (targetEmail, usersObj) => {
  for (const user in usersObj) {
    if (targetEmail === usersObj[user].email) {
      return true;
    }
  }
  return false;
}

//
// DATABASE
//

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  '1t55sw': {
    id: '1t55sw',
    email: 'a@b.c',
    password: 123
  }
};

//
// MIDDLEWARE
//
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//
// ALL THE ROUTES
//
// to acess the correct user, use the cookie! req.cookie gives obj like this { user_id: gibberish }
//

app.get('/register', (req, res) => {
  const currentUser = users[req.cookies.user_id];
  const templateVars = { urls: urlDatabase, user: currentUser };
  return res.render('urls_register', templateVars);
});


app.post('/register', (req, res) => {
  let randomID = generateRandomString();
  
  if (req.body.email === '' || req.body.password === '') {
    res.send('404 - input feilds require inputs');
  }
  
  if (getUserByEmail(req.body.email, users)) {
    res.send('404 - email already registered, redirecting to login');
  }

  users[randomID] = { id: randomID, email: req.body.email, password: req.body.password };
  // currentUser = users[req.cookie.user_id];
  // const templateVars = { users: currentUser };
  res.cookie('user_id', randomID);
  return res.redirect('/urls');
});

app.post('/login', (req, res) => {

  return res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const currentUser = users[req.cookies.user_id]
  let templateVars = {user: currentUser} 
  return res.render('login', templateVars)
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  return res.redirect('/urls');
});

app.get('/', (req, res) => {
  return res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const currentUser = users[req.cookies.user_id];
  const templateVars = { urls: urlDatabase, user: currentUser };
  // req.cookies - gives object value of the cookie(s)
  return res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const currentUser = users[req.cookies.user_id];
  const templateVars = { user: currentUser };
  return res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let temp = generateRandomString();
  urlDatabase[temp] = req.body.longURL;
  return res.redirect(`/urls/${temp}`);
});

app.get("/urls/:id", (req, res) => {
  const currentUser = users[req.cookies.user_id];
  const templateVars = { user: currentUser, longURL: urlDatabase[req.params.id] };
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