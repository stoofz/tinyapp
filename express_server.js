const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { generateRandomString, userCheck, findUserUrls, findEmailObj } = require('./helpers');
const methodOverride = require('method-override');

app.use(methodOverride('_method'));
app.use(
  cookieSession({
    name: 'session',
    keys: ['54647-u56hg-b334f-3vb4f-v3c43', '44342-ug3hg-b3355-4224f-v4513'],
  })
);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Create initial url db
const urlDatabase = {};

// Create initial user account db
const users = {};

// Redirect root route based on login status
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect(302, "/urls");
  } else {
    res.redirect(302, "/login");
  }
});

// Post end point to create a random short url id
app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    res.status(401).send('Must be logged in to create a short URL');
  } else {
    urlDatabase[generateRandomString()] = {
      longURL: req.body.longURL,
      userId: req.session.userId
    };
    res.redirect(302, "/urls");
  }
});

// Display url database for logged in user
app.get("/urls", (req, res) => {
  if (!req.session.userId) {
    res.status(401).send('Must be logged in to view URLs');
  } else {
    const urlUserDatabase = findUserUrls(req.session.userId, urlDatabase);
    const templateVars = {
      userObj: users[req.session.userId],
      urls: urlUserDatabase
    };
    res.render("urls_index", templateVars);
  }
});

// Create a new url link
app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    res.redirect(302, "/login");
  } else {
    const templateVars = {
      userObj: users[req.session.userId]
    };
    res.render("urls_new", templateVars);
  }
});

// Redirect short url to actual url
app.get("/u/:id", (req, res) => {
  if (req.params.id in urlDatabase) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(302, longURL);
  } else {
    res.status(404).send('Short URL does not exist');
  }
});

// Post request to modify url of a short id
app.put("/urls/:id", (req, res) => {
  if (userCheck(req, res, urlDatabase)) {
    // empty (for ES-Lint)
  } else {
    urlDatabase[req.params.id] = {
      longURL: req.body.newURL,
      userId: req.session.userId
    };
    res.redirect(302, "/urls");
  }
});

// Post request to delete a short id
app.delete("/urls/:id", (req, res) => {
  if (userCheck(req, res, urlDatabase)) {
    // empty (for ES-Lint)
  } else {
    delete urlDatabase[req.params.id];
    res.redirect(302, "/urls");
  }
});

// Login a username and create a cookie
app.post("/login", (req, res) => {
  const userObj = findEmailObj(req.body.email, users);
  if (!userObj) {
    res.status(401).send('Email address not found');
  } else if (bcrypt.compareSync(req.body.password, userObj.password)) {
    req.session.userId = userObj.id;
    res.redirect(302, "/urls");
  } else {
    res.status(401).send('Wrong password!');
  }
});

// Login page
app.get("/login", (req, res) => {
  if (req.session.userId) {
    res.redirect(302, "/urls");
  } else {
    const templateVars = {
      userObj: users[req.session.userId]
    };
    res.render("urls_login", templateVars);
  }
});

// Clears cookie, logs out users
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(302, "/login");
});

// Register user
app.post("/register", (req, res) => {
  if (req.body.email.length === 0 || req.body.password === 0) {
    res.status(400).send('Empty email or password field');
  } else if (findEmailObj(req.body.email, users)) {
    res.status(400).send('Email already registerd');
  } else {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const randomUserID = generateRandomString();
    users[randomUserID] = {
      id: randomUserID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.userId = randomUserID;
    res.redirect(302, "/urls");
  }
});

// Register user
app.get("/register", (req, res) => {
  if (req.session.userId) {
    res.redirect(302, "/urls");
  } else {
    const templateVars = {
      userObj: users[req.session.userId],
    };
    res.render("urls_register", templateVars);
  }
});

// Display page for url based on short id
app.get("/urls/:id", (req, res) => {
  if (userCheck(req, res, urlDatabase)) {
    // empty (for ES-Lint)
  } else {
    const templateVars = {
      userObj: users[req.session.userId],
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL
    };
    res.render("urls_show", templateVars);
  }
});

// Server launched on port/accepting connections
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});