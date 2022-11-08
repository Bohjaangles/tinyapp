const bcrypt = require("bcryptjs");


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
    bcrypt.compareSync(targetPW, usersObj[user].password);
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

// Function for use in ensuring that user permissions are followed in repect to specific content when called
const urlsForUser = (userid, database) => {
  let filterdDB = {};
  for (const data in database) {
    if (database[data].userID === userid) {
      filterdDB[data] = database[data];
    }
  }
  return filterdDB;
};

module.exports = { urlsForUser, getUserByEmail, validatePW, validateEmail, generateRandomString };