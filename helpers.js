
// Generate Random String of 6 capital/lowercase leters and numbers
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

// Permission check
const userCheck = function(req, res, db) {
  if (!(req.params.id in db)) {
    return res.status(404).send('Short URL id does not exist!');
  } else if (!req.session.userId) {
    return res.status(401).send('Must be logged in to access this page');
  } else if (db[req.params.id].userId !== req.session.userId) {
    return res.status(401).send('Page is only accessible by its owner');
  }
};

// Find urls belonging to user from url database
const findUserUrls = function(userId, db) {
  const userUrls = {};
  for (const shortUrl in db) {
    if (userId === db[shortUrl].userId) {
      userUrls[shortUrl] = db[shortUrl];
    }
  }
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

module.exports = { generateRandomString, userCheck, findUserUrls, findEmailObj };