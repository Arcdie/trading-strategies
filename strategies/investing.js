const redis = require('./redis');

const INSTRUMENTS_KEY = 'INSTRUMENTS';
const CANDLES_KEY = 'INSTRUMENTS:*:CANDLES';

const SUM_PURCHASE = 5;
const START_DEPOSIT = 2000;

let deposit = START_DEPOSIT;
let numberCoins = 0;
let spentAmount = 0;

const results = [];

const toFixed = (price, fixed = 1) => parseFloat(price.toFixed(fixed));

const run = async () => {
  const targetInstruments = JSON.parse(await redis.get(INSTRUMENTS_KEY));
  // const targetInstruments = ['BNBUSDT', 'BAKEUSDT', 'ONEUSDT'];
  // const targetInstruments = ['BAKEUSDT'];
  // const targetInstruments = ['ONEUSDT'];

  await Promise.all(targetInstruments.map(async (instrument) => {
    const result = {
      instrument,
      numberCoins: 0,
      spentAmount: 0,
    };

    const candles = JSON.parse(await redis.get(CANDLES_KEY.replace('*', instrument))).reverse();

    candles.forEach((candle, index) => {
      if (index === 0) return;
      
      const { close } = candle;
      const { close: prevClose } = candles[index - 1];

      const difference = close - prevClose;
      const percentPerClose = Math.abs(100 / (prevClose / difference));

      if (difference < 0 && percentPerClose >= 5) {
      // if ((difference > 0 && percentPerClose >= 3)
      //   || (difference < 0 && percentPerClose >= 5)) {
        const orderAmount = toFixed(SUM_PURCHASE / candle.close, 8);

        spentAmount += SUM_PURCHASE;
        result.spentAmount += SUM_PURCHASE;
        result.numberCoins += orderAmount;
      }
    });

    result.result = result.numberCoins * candles.at(-1).close;
    results.push(result);
  }));

  const sorted = results.sort((a, b) => a.result < b.result ? 1 : -1);
  const commonResult = results.reduce((acc, v) => acc + v.result, 0);

  sorted.forEach((e) => console.log(e.instrument, toFixed(e.result), toFixed(e.spentAmount)));
  
  console.log('spentAmount', spentAmount);
  console.log('commonResult', toFixed(commonResult), toFixed(commonResult / spentAmount, 2));
};

run();
