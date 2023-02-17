require("dotenv").config();
const parseArgs = require('minimist')

const args = parseArgs(process.argv.slice(2))

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  HOST: process.env.HOST || "127.0.0.1",
  PORT: args._[0] || 8080,

};