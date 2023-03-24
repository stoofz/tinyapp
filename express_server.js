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

// Generate Random String of 6 capital/lowercase leters and numbers
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

// Display url database as a json endpoint
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Post end point to create a random short url id
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect("/urls");
});

// Display url database
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// Redirect short url to actual url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Post request to modify url of a short id
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
});

// Post request to delete a short id
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Login a username and create a cookie
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username, { maxAge: 900000 });
  res.redirect("/urls");
});

// Display/edit page for url based on short id
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

// Server launched on port/accepting connections
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

