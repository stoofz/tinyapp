
// Generate Random String of 6 capital/lowercase leters and numbers
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
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

module.exports = { generateRandomString, findUserUrls, findEmailObj };