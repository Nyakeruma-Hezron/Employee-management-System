require("dotenv").config();

let mongoURI;
if (!process.env.DATABASEURL) {
  // Assuming config.js.js.js is in your root backend folder
  mongoURI = require("../config.js.js.js").DATABASEURL;
} else {
  mongoURI = process.env.DATABASEURL;
}

let jwtKey;
if (!process.env.JWTKEY) {
  // Assuming jwtKey.js.js.js is in your root backend folder
  jwtKey = require("../jwtKey.js.js.js").jwtKey;
} else {
  jwtKey = process.env.JWTKEY;
}

module.exports = { mongoURI, jwtKey };