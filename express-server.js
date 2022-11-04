// PRE CONFIG
const express = require('express');
const app = express();
const port = 8080;
const cookieParser = require('cookie-parser');
const { signedCookie } = require('cookie-parser');
const morgan = require('morgan');
const bcrypt = require("bcryptjs");

// 
// ********   MISC functions and essentials
//
const salt = bcrypt.genSaltSync();

app.set('view engine', 'ejs');

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

// looks through an object for of users for an object whose email key matches the target email
const validateEmail = (targetEmail, usersObj) => {
  for (const user in usersObj) {
    if (targetEmail === usersObj[user].email) {
      return true;
    }
  }
  return false;
};

const validatePW = (targetPW, usersObj) => {
  for (const user in usersObj) {
    bcrypt.compareSync(targetPW, usersObj[user].password)
    if (bcrypt.compareSync(targetPW, usersObj[user].password)) {
      return true;
    }
  }
  return false;
};

const getUserByEmail = (email, usersObj) => {
  for (const user in usersObj) {
    if (email === usersObj[user].email) {
      return user;
    }
  }
  return;
};

const urlsForUser = (userid, database) => {
  let filterdDB = {};
  for (const data in database) {
    if (database[data].userID === userid){
      filterdDB[data] = database[data]
    }
  }
  return filterdDB;
};


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
app.use(cookieParser());

//
//                                   ~~~~~~~~~~~~~ALL THE ROUTES~~~~~~~~~~~~~
//
// to acess the correct user, use the cookie! req.cookie gives obj like this { user_id: gibberish }
//

app.get('/register', (req, res) => {
  if (req.cookies.user_id) {
    return res.redirect('/urls');
  }
  let templateVars = { user: undefined}
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

  res.cookie('user_id', randomID);
  return res.redirect('/urls');
});

///                ///////  REGISTER  \\\\\\\\\
//                 ----------------------------
///                \\\\\\\\  LOGIN   //////////


app.get('/login', (req, res) => {
  if (req.cookies.user_id) {
    return res.redirect('/urls');
  }

  const currentUser = users[req.cookies.user_id];
  let templateVars = { user: currentUser };
  return res.render('login', templateVars);
});

app.post('/login', (req, res) => {

  if (!validateEmail(req.body.email, users)) {
    res.send(' 403 ');
  }
  if (!validatePW(req.body.password, users)) {
    res.send('403');
  }
  let userID = getUserByEmail(req.body.email, users);

  res.cookie('user_id', userID);
  return res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  return res.redirect('/login');
});

// ======================================== USER LOGIN / REGISTRATION ^^^
//
// ======================================== APP FUNCTIONALITY VVV

app.get('/', (req, res) => {
  return res.redirect('/register');
});

app.get('/urls', (req, res) => {
  if (!req.cookies.user_id) {
    const errorMsg = 'must be logged in to view this content';
    let templateVars = { error: errorMsg, user: undefined};
    return res.render('error', templateVars);
  }
  const currentUser = users[req.cookies.user_id];
  let filtered = urlsForUser(req.cookies.user_id, urlDatabase);
  let templateVars = { urls: filtered, user: currentUser }; // replace database with filtered database
  // req.cookies - gives object value of the cookie(s)
  return res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect('/login');
  }
  const currentUser = users[req.cookies.user_id];
  const templateVars = { user: currentUser };
  return res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  if (!req.cookies.user_id){
    const errorMsg = 'Must be logged in to shorten urls';
    templateVars = { error: errorMsg, user: undefined};
    return res.render('error', templateVars);
  }
  let randomID = generateRandomString();
  if (req.cookies.user_id) {
    urlDatabase[randomID] = {
      longURL: req.body.longURL,
      userID: req.cookies.user_id
    };
  };
  return res.redirect(`/urls/${randomID}`);
});

// for get, use req.params / vs post uses req.body
app.get("/urls/:id", (req, res) => {
  if (!req.cookies.user_id) {
    const errorMsg = 'Must be logged in to view this content';
    const templateVars = { error: errorMsg, user: undefined};
    return res.render('error', templateVars);
  }
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    const errorMsg = 'can only view content associated with your account';
    const templateVars = { error: errorMsg, user: req.cookies.user_id };
    return res.render('error', templateVars);
  }
  
  const currentUser = users[req.cookies.user_id];
  const templateVars = { user: currentUser, urlInfo: urlDatabase[req.params.id], shortUrlId: req.params.id };
  // console.log('urlinfo', `${JSON.stringify(req.params.id)}`);
  return res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    const errorMsg = 'can only view/manipulate content associated with your account';
    const templateVars = { error: errorMsg, user: req.cookies.user_id };
    return res.render('error', templateVars);
  }
  if (req.cookies.user_id) {
    delete urlDatabase[req.params.id];
  }
  return res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  if (req.cookies.user_id) {
    // urlDatabase[req.params.id] = {
    //   longURL: req.body.longURL,
    //   userID: req.cookies.user_id
    return res.redirect('/urls');
  }



  return res.redirect('/register');
});

app.get(`/u/:id`, (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    const errorMsg = 'can only view content associated with your account';
    const templateVars = { error: errorMsg, user: req.cookies.user_id };
    return res.render('error', templateVars);
  }
  if (!urlDatabase[req.params.id]){
    const errorMsg = 'this short url does not exist, please check spelling, or try again';
    let templateVars = { error: errorMsg, user: (req.cookies.user_id ? req.cookies.user_id : undefined )}
    return res.render('error', templateVars);
  }
  const longURL = urlDatabase[req.params.id].longURL;
  return res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  return res.json(urlDatabase);
});

app.get('/error', (req, res) => {
  const currentUser = users[req.cookies.user_id];
  const templateVars = { user: currentUser }
  return res.render('error', templateVars);
})

//
// .......................IT LISTENS...
//

app.listen(port, () => {
  console.log(`you are listening on port ${port}`);
});