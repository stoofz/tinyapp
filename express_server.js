const express = require("express");
const app = express();
const PORT = 8080;

const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Create initial url db
const urlDatabase = {};

// Create initial user account db
const users = {};

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

// Find urls belonging to user from url database
const urlsForUser = function(userId, db) {
  const userUrls = {};
  for (const shortUrl in db) {
    if (userId === db[shortUrl].userId) {
      userUrls[shortUrl] = db[shortUrl];
    }
  }
  console.log(userUrls);
  return userUrls;
};

// Find user object from email value
const findEmailObj = function(email, db) {
  for (const obj of Object.values(db)) {
    if (obj.email === email) {
      return (obj);
    }
  }
};

// Redirect root route based on login status
app.get("/", (req, res) => {
  if (findUserObj(Object.keys((req.cookies))[0], users)) {
    res.redirect(302, "/urls");
  } else {
    res.redirect(302, "/login");
  }
});

// Post end point to create a random short url id
app.post("/urls", (req, res) => {
  const userObj = (findUserObj(Object.keys((req.cookies))[0], users));
  if (!userObj) {
    res.status(401).send('Must be logged in to create a short URL');
  } else {
    urlDatabase[generateRandomString()] = {
      longURL: req.body.longURL,
      userId: userObj.id
    };
    res.redirect(302, "/urls");
  }
});

// Display url database for logged in user
app.get("/urls", (req, res) => {
  const userObj = (findUserObj(Object.keys((req.cookies))[0], users));
  if (!userObj) {
    res.status(401).send('Must be logged in view URLs');
  } else {
    const urlUserDatabase = urlsForUser(userObj.id, urlDatabase);
    const templateVars = {
      userObj: userObj,
      urls: urlUserDatabase
    };
    res.render("urls_index", templateVars);
  }
});

// Create a new url link
app.get("/urls/new", (req, res) => {
  const userObj = (findUserObj(Object.keys((req.cookies))[0], users));
  if (!userObj) {
    res.redirect(302, "/login");
  } else {
    const templateVars = {
      userObj: userObj
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
app.post("/urls/:id", (req, res) => {
  const userObj = (findUserObj(Object.keys((req.cookies))[0], users));
  if (!(req.params.id in urlDatabase)) {
    res.status(404).send('Short URL id does not exist!');
  } else if (!userObj) {
    res.status(401).send('Must be logged in to access this page');
  } else if (urlDatabase[req.params.id].userId !== userObj.id) {
    res.status(401).send('Page is only accessible by its owner');
  } else {
    const userObj = findUserObj(Object.keys((req.cookies))[0], users);
    urlDatabase[req.params.id] = {
      longURL: req.body.newURL,
      userId: userObj.id
    };
    res.redirect(302, "/urls");
  }
});

// Post request to delete a short id
app.post("/urls/:id/delete", (req, res) => {
  const userObj = (findUserObj(Object.keys((req.cookies))[0], users));
  if (!(req.params.id in urlDatabase)) {
    res.status(404).send('Short URL id does not exist!');
  } else if (!userObj) {
    res.status(401).send('Must be logged in to access this page');
  } else if (urlDatabase[req.params.id].userId !== userObj.id) {
    res.status(401).send('Page is only accessible by its owner');
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
  } else if (userObj.password !== req.body.password) {
    res.status(401).send('Wrong password!');
  } else {
    res.cookie(userObj.id, userObj.email, { maxAge: 900000 });
    res.redirect(302, "/urls");
  }
});

// Login page
app.get("/login", (req, res) => {
  const userObj = findUserObj(Object.keys((req.cookies))[0], users);
  if (userObj) {
    res.redirect(302, "/urls");
  } else {
    const templateVars = {
      userObj: userObj
    };
    res.render("urls_login", templateVars);
  }
});

// Clears cookie, logs out users
app.post("/logout", (req, res) => {
  const userObj = findUserObj(Object.keys((req.cookies))[0], users);
  res.clearCookie(userObj.id);
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
    res.cookie(randomUserID, users[randomUserID].email, { maxAge: 900000 });
    res.redirect(302, "/urls");
  }
});

// Register user
app.get("/register", (req, res) => {
  const userObj = findUserObj(Object.keys((req.cookies))[0], users);
  if (userObj) {
    res.redirect(302, "/urls");
  } else {
    const templateVars = {
      userObj: userObj,
    };
    res.render("urls_register", templateVars);
  }
});

// Display/edit page for url based on short id
app.get("/urls/:id", (req, res) => {
  const userObj = (findUserObj(Object.keys((req.cookies))[0], users));
  if (!(req.params.id in urlDatabase)) {
    res.status(404).send('Short URL id does not exist!');
  } else if (!userObj) {
    res.status(401).send('Must be logged in to access this page');
  } else if (urlDatabase[req.params.id].userId !== userObj.id) {
    res.status(401).send('Page is only accessible by its owner');
  } else {
    const templateVars = {
      userObj: userObj,
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