const express = require("express");
const app = express();
const PORT = 8080;

const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Create initial url database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Create initial user accounts
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Generate Random String of 6 capital/lowercase leters and numbers
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

// Find userId object from userId key
const findUserObj = function(userId, db) {
  for (const key in db) {
    if (key === userId) {
      return db[key];
    }
  }
};

// Find user object from email value
const findEmailObj = function(email, db) {
  for (const obj of Object.values(db)) {
    if (obj.email === email) {
      return (obj);
    }
  }
};

// Display url database as a json endpoint
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Post end point to create a random short url id
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect(302, "/urls");
});

// Display url database
app.get("/urls", (req, res) => {
  const templateVars = {
    userObj: findUserObj(Object.keys((req.cookies))[0], users),
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// Create a new url link
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userObj: findUserObj(Object.keys((req.cookies))[0], users)
  };
  res.render("urls_new", templateVars);
});

// Redirect short url to actual url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(302, longURL);
});

// Post request to modify url of a short id
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(302, "/urls");
});

// Post request to delete a short id
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(302, "/urls");
});

// Login a username and create a cookie
app.post("/login", (req, res) => {
  const emailObj = findEmailObj(req.body.email, users);
  if (!emailObj) {
    res.status(403).send('Email address not found');
  } else if
  (emailObj.password !== req.body.password) {
    res.status(403).send('Wrong password!');
  } else {
    res.cookie(emailObj.id, generateRandomString(), { maxAge: 900000 });
    res.redirect(302, "/urls");
  }
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    userObj: findUserObj(Object.keys((req.cookies))[0], users)
  };
  res.render("urls_login", templateVars);
});

// Clears cookie, logs out users
app.post("/logout", (req, res) => {
  const userId = findUserObj(Object.keys((req.cookies))[0], users);
  res.clearCookie(userId.id);
  res.redirect(302, "/login");
});

// Register user
app.post("/register", (req, res) => {
  if (req.body.email.length === 0 || req.body.password === 0) {
    res.status(400).send('Empty email or password field');
  } else if (findEmailObj(req.body.email, users)) {
    res.status(400).send('Email already registerd');
  } else {
    const randomUserID = generateRandomString();
    users[randomUserID] = {
      id: randomUserID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie(randomUserID, generateRandomString(), { maxAge: 900000 });
    res.redirect(302, "/urls");
  }
});

// Register user
app.get("/register", (req, res) => {
  const templateVars = {
    userObj: findUserObj(Object.keys((req.cookies))[0], users),
  };
  res.render("urls_register", templateVars);
});

// Display/edit page for url based on short id
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    userObj: findUserObj(Object.keys((req.cookies))[0], users),
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

// Server launched on port/accepting connections
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

