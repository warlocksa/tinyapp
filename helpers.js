const { all } = require("express/lib/application");

const getUserByEmail = (email, database) => {
  for (let id in database) {
    if (email === database[id].email) {
      const userID = database[id];
      return userID;
    }
  } return undefined;
};

const getUrlsOfUser = (userId, database) => {
  let urlObj = {};
  for (let urlId in database) {
    if (database[urlId].userID === userId) {
      urlObj[urlId] = database[urlId]
    }
  }
  return urlObj;
};

const getlongURLFromShortURL = (userId, database, shortURL) => {
  for (let surl in database) {
    if(database[surl].userID === userId && surl === shortURL) {
      return surl;
    }
  }
  return null;
};


const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
}

module.exports = { getUserByEmail, getUrlsOfUser, getlongURLFromShortURL, generateRandomString };