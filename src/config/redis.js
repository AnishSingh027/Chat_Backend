const Redis = require("ioredis");

let redis;

const connectToRedis = async (url) => {
  try {
    redis = new Redis(url);
    redis.on("connect", () => console.log("Redis connected successfully"));
  } catch (error) {
    console.log(error);
  }
};

const getRedis = () => redis;

module.exports = { connectToRedis, getRedis };
