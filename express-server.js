// PRE CONFIG
const express = require('express');
const app = express();
const port = 8080;
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const { urlsForUser, getUserByEmail, validatePW, validateEmail, generateRandomString } = require('./helpers.js');

// 
// ********   MISC functions and essentials
//

app.set('view engine', 'ejs'); // this guy just likes being here :)

//
//                                     VVVVV--------> DATABASE(s) <--------VVVVV
//

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: '1t55sw'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: '1t55sw'
  },
  "9fd3Gt": {
    longURL: 'https://www.yahoo.com',
    userID: '2g44ws'
  }
};

const users = {
  '1t55sw': {
    id: '1t55sw',
    email: 'a@b.c',
    password: bcrypt.hashSync('123')
  },
  '2g44ws': {
    id: '2g44ws',
    email: 'c@b.a',
    password: bcrypt.hashSync('321')
  }
};

//
//                                                >>>> MIDDLEWARE <<<<
//
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['VerySecretSauce'],
}));

//
//                                   ~~~~~~~~~~~~~ALL THE ROUTES~~~~~~~~~~~~~
//
// to acess the correct user, use the cookie! req.cookie gives obj like this { user_id: gibberish }
//

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  let templateVars = { user: undefined };
  return res.render('urls_register', templateVars);
});


app.post('/register', (req, res) => {
  let randomID = generateRandomString();

  if (req.body.email === '' || req.body.password === '') {
    res.send('404');
  }

  if (validateEmail(req.body.email, users)) {
    res.send('404');
  }
  let hashed = bcrypt.hashSync(req.body.password);
  users[randomID] = { id: randomID, email: req.body.email, password: hashed };

  req.session.user_id = randomID;
  return res.redirect('/urls');
});

///                ///////  REGISTER  \\\\\\\\\
//                 ----------------------------
///                \\\\\\\\  LOGIN   //////////


app.get('/login', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }

  const currentUser = users[req.session.user_id];
  let templateVars = { user: currentUser };
  return res.render('login', templateVars);
});

app.post('/login', (req, res) => {

  if (!validateEmail(req.body.email, users) || !validatePW(req.body.password, users)) {
    const errorMsg = 'Invalid email or password. Please try again!';
    let templateVars = { error: errorMsg, user: undefined };
    return res.render('error', templateVars);
  }
  let userID = getUserByEmail(req.body.email, users);

  req.session.user_id = userID;
  return res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/login');
});

// ======================================== USER LOGIN / REGISTRATION ^^^
//
// ======================================== APP FUNCTIONALITY VVV

app.get('/', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls')
  }
  return res.redirect('/login');
});

app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    const errorMsg = 'must be logged in to view this content';
    let templateVars = { error: errorMsg, user: undefined };
    return res.render('error', templateVars);
  }
  const currentUser = users[req.session.user_id];
  let filtered = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = { urls: filtered, user: currentUser }; // replace database with filtered database for user permissions
  return res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const currentUser = users[req.session.user_id];
  const templateVars = { user: currentUser };
  return res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    const errorMsg = 'Must be logged in to shorten urls';
    templateVars = { error: errorMsg, user: undefined };
    return res.render('error', templateVars);
  }
  let randomID = generateRandomString();
  if (req.session.user_id) {
    urlDatabase[randomID] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
  };
  return res.redirect(`/urls/${randomID}`);
});

// for get, use req.params / vs post uses req.body
app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    const errorMsg = 'Must be logged in to view this content';
    const templateVars = { error: errorMsg, user: undefined };
    return res.render('error', templateVars);
  }

  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    const errorMsg = 'can only view content associated with your account';
    const templateVars = { error: errorMsg, user: req.session.user_id };
    return res.render('error', templateVars);
  }

  const currentUser = users[req.session.user_id];
  const templateVars = { user: currentUser, urlInfo: urlDatabase[req.params.id], shortUrlId: req.params.id };
  return res.render("urls_show", templateVars);
});

app.post('/urls/:id', (req, res) => {
  if (req.session.user_id) {
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    return res.redirect('/urls');
  }
  return res.redirect('/register');
});

app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.user_id) {
    const errorMsg = 'can only view/manipulate content associated with your account';
    const templateVars = { error: errorMsg, user: req.session.user_id };
    return res.render('error', templateVars);
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    const errorMsg = 'can only view/manipulate content associated with your account';
    const templateVars = { error: errorMsg, user: req.session.user_id };
    return res.render('error', templateVars);
  }
  if (req.session.user_id) {
    delete urlDatabase[req.params.id];
  }
  return res.redirect('/urls');
});

app.get(`/u/:id`, (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    const errorMsg = 'can only view content associated with your account';
    const templateVars = { error: errorMsg, user: req.session.user_id };
    return res.render('error', templateVars);
  }
  if (!urlDatabase[req.params.id]) {
    const errorMsg = 'this short url does not exist, please check spelling, or try again';
    let templateVars = { error: errorMsg, user: (req.session.user_id ? req.session.user_id : undefined) };
    return res.render('error', templateVars);
  }
  const longURL = urlDatabase[req.params.id].longURL;
  return res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  return res.json(urlDatabase);
});

app.get('/error', (req, res) => {
  const currentUser = users[req.session.user_id];
  const templateVars = { user: currentUser };
  return res.render('error', templateVars);
});

app.get('*', (req, res) => {
  res.redirect('/urls');
});

//
// .......................IT LISTENS...
//

app.listen(port, () => {
  console.log(`you are listening on port ${port}`);
});