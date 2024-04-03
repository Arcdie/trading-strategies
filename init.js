const redis = require('./redis');
const { getExchangeInfo, get1hCandles } = require('./binance');

const run = async () => {
  const result = await getExchangeInfo();
  
  const symbols = result.symbols
    .filter((s) => s.symbol.includes('USDT') && s.status === 'TRADING')
    .map((s) => s.symbol);
  
  await redis.set('INSTRUMENTS', JSON.stringify(symbols));

  let numberProcessed = 0;

  for await (const symbol of symbols) {
    const rawCandles = await get1hCandles(symbol);

    const candles = rawCandles.map((c) => ({
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5]),
      time: new Date(c[0]),
    })).reverse();

    await redis.set(
      `INSTRUMENTS:${symbol}:CANDLES_1H`,
      JSON.stringify(candles)
    );

    numberProcessed += 1;
    console.log(numberProcessed, '/', symbols.length);
  }
};

run();
