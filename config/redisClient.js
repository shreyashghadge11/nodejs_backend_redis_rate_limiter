const redis = require("redis");
const { REDIS_URL } = require("./index");

let redisClient;

//Initialize Redis Client
const initializeRedis = async () => {
  redisClient = redis.createClient({
    url: REDIS_URL,
  });

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
  console.log("Redis client connected");
};

//Get Redis Client
const getRedisClient = () => {
  return redisClient;
};

module.exports = {
  initializeRedis,
  getRedisClient,
};
