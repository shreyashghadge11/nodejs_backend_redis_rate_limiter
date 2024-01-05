const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = require("../config/index");
const { getRedisClient } = require("../config/redisClient");
const { RATE_LIMIT } = require("../config/index");

const authenticateUser = (req, res, next) => {
  const bearerToken = req.headers.authorization;

  // Check if the token is present
  if (!bearerToken) {
    return res.status(401).json({ error: "Unauthorized: Token not provided" });
  }

  try {
    // Verify the token
    const token = bearerToken.split(" ")[1];
    const decoded = jwt.verify(token, TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Rate limiting middleware
const notesRateLimit = async (req, res, next) => {
  const redisClient = await getRedisClient();
  const userId = req.userId;

  // Check if the user has made more than 50 requests in the last hour
  const redisKey = `speer-app:user:${userId}:requests`;

  try {
    const currentCount = await redisClient.incr(redisKey);
    console.log(currentCount);

    if (currentCount === 1) {
      await redisClient.expire(redisKey, 3600);
    }

    if (currentCount > RATE_LIMIT) {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error Redis" });
  }
};

module.exports = {
  authenticateUser,
  notesRateLimit,
};
