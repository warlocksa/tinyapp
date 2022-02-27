const getUserByEmail = (email, database) => {
  for (let id in database) {
    if (email === database[id].email) {
      const userID = database[id].id;
      return userID;
    } 
  } return undefined
};

module.exports = { getUserByEmail };