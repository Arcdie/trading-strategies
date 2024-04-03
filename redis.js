const { createClient } = require('redis');

const redisConfig = {
  host: 'localhost',
  port: 6379,
};

connection = createClient({
  url: `redis://${redisConfig.host}:${redisConfig.port}`,
});

connection
  .on('connect', () => console.log('Connection to Redis is successful'))
  .on('error', (err) => console.log(err))
  .connect();

module.exports = connection
