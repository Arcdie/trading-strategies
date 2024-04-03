const redis = require('./redis');
const { getUnix } = require('./libs/helpers');
const { sendMessage } = require('./telegram');
const initCandlesListener = require('./listener');

const run = async () => {
  const instruments = JSON.parse((await redis.get('INSTRUMENTS')));

  initCandlesListener(instruments, async (message) => {
    const key = `INSTRUMENTS:${message.symbol}:CANDLES`;

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

    let averageVolume = await redis.get(`${key}:AVERAGE_VOLUME`);
    

    if (averageVolume) {
      averageVolume = parseFloat(averageVolume);

      if (message.volume > (averageVolume * 2)) {
        const lastNotificationKey = `${key}:AVERAGE_VOLUME:LAST_NOTIFICATION`;
        const lastNotification = await redis.get(lastNotificationKey);

        if (!lastNotification) {
          const candles = JSON.parse(await redis.get(key));

          if (candles[0].volume > averageVolume
              && message.volume > candles[0].volume
          ) {
            const msg = `https://ru.tradingview.com/chart/XCMsz22F/?symbol=BINANCE:${message.symbol}.P`;

            console.log(msg);
            sendMessage(msg);

            await redis.set(lastNotificationKey, getUnix().toString(), {
              EX: 10 * 60,
            });
          }
        }
      }
    }
  });

  const calculateAverage = async () => {
    await Promise.all(instruments.map(async symbol => {
      const key = `INSTRUMENTS:${symbol}:CANDLES`;
      const candles = JSON.parse(await redis.get(key)); 

      const sum = candles.reduce((a, v) => a + v.volume, 0);
      const average = sum / candles.length;
      await redis.set(`${key}:AVERAGE_VOLUME`, average);
    }));
  };

  calculateAverage();
  setInterval(() => calculateAverage(), 5 * 60 * 1000);
};

run();
