const redis = require('./redis');
const initCandlesListener = require('./listener');

const run = async () => {
  const instruments = JSON.parse((await redis.get('INSTRUMENTS')));

  initCandlesListener(instruments, async (message) => {
    const key = `INSTRUMENTS:${message.symbol}:CANDLES_1H`;

    if (message.isClosed) {
      const candles = JSON.parse(await redis.get(key));

      candles.unshift({
        open: message.open,
        high: message.high,
        low: message.low,
        close: message.close,
        volume: message.volume,
        time: message.startTime,
      });

      candles.pop();
      await redis.set(key, JSON.stringify(candles));
    }
  });
};

run();
