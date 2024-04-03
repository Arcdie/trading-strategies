const redis = require('../redis');
const { sendMessage } = require('../telegram');
const { getUnix } = require('../libs/helpers');

const INSTRUMENTS_KEY = 'INSTRUMENTS';
const CANDLES_KEY = 'INSTRUMENTS:*:CANDLES_1H';

const LONG_MA_PERIOD = 200;
const MEDIUM_MA_PERIOD = 50;

const checkMACrossing = async () => {
  const targetInstruments = JSON.parse(await redis.get(INSTRUMENTS_KEY));

  await Promise.all(targetInstruments.map(async (symbol) => {
    const key = CANDLES_KEY.replace('*', symbol);
    const candles = JSON.parse(await redis.get(key)).reverse();
    const longMAResults = calculateData(candles, LONG_MA_PERIOD);
    const mediumMAResults = calculateData(candles, MEDIUM_MA_PERIOD);

    const prevMediumMA = mediumMAResults.at(-3);
    const currentMediumMA = mediumMAResults.at(-1);

    const prevLongMA = longMAResults.at(-3);
    const currentLongMA = longMAResults.at(-1);

    if ((prevMediumMA > prevLongMA && currentMediumMA < currentLongMA)
      || (prevMediumMA < prevLongMA && currentLongMA > currentMediumMA)) {
      const lastNotificationKey = `${key}:MA_CROSSING:LAST_NOTIFICATION`;
      const lastNotification = await redis.get(lastNotificationKey);

      if (!lastNotification) {
        const msg = `https://ru.tradingview.com/chart/XCMsz22F/?symbol=BINANCE:${symbol}.P`;

        console.log(msg);
        sendMessage(msg);

        await redis.set(lastNotificationKey, getUnix().toString(), {
          EX: 10 * 30,
        });
      }
    }
  }));

  console.log('Finished');
};

const calculateData = (inputData, period) => {
  const resultData = [];
  const workingData = [];

  inputData.forEach((candle, index) => {
    workingData.push(candle.close);

    const currentData = workingData.slice(index - (period - 1));
    const sum = currentData.reduce((i, close) => i + close, 0);
    const average = sum / currentData.length;

    resultData.push({
      time: candle.time,
      value: average,
    });
  });

  return resultData;
}

checkMACrossing();

const nowUnix = getUnix();
const nextHourInSeconds = nowUnix - (nowUnix % 3600) + 3600;
const secondsToNextHour = nextHourInSeconds - nowUnix;

setTimeout(() => setInterval(() => checkMACrossing(), 3600 * 1000), secondsToNextHour * 1000);
