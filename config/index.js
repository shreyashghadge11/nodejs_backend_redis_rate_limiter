const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL,
  RATE_LIMIT: process.env.RATE_LIMIT,
};
