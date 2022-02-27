const getUserByEmail = (email, database) => {
  for (let id in database) {
    if (email === database[id].email) {
      const user = database[id];
      return user;
    }
  }
};

module.exports = { getUserByEmail };