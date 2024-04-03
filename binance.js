const axios = require('./axios');

const API_ENDPOINT_FUTURES = 'https://fapi.binance.com';
const WEBSOCKET_ENDPOINT_FUTURES = 'wss://fstream.binance.com';
const PATH_FOR_MULTIPLE_STREAMS = 'stream?streams=';

const getFullUrl = (link) => `${API_ENDPOINT_FUTURES}${link}`;

const getExchangeInfo = async () => {
  const url = '/fapi/v1/exchangeInfo';
  const response = await axios.makeGetRequest(getFullUrl(url));
  return response.data;
};

const get5mCandles = async (symbol) => {
  const url = '/fapi/v1/klines';

  const response = await axios.makeGetRequest(getFullUrl(url), {
    symbol,
    interval: '5m',
    limit: 60, // 5 hours
  });

  return response.data;
};

const get1hCandles = async (symbol) => {
  const url = '/fapi/v1/klines';

  const response = await axios.makeGetRequest(getFullUrl(url), {
    symbol,
    interval: '1h',
    limit: 336, // 14 days
  });

  return response.data;
};

const get1dCandles = async (symbol) => {
  const url = '/fapi/v1/klines';

  const response = await axios.makeGetRequest(getFullUrl(url), {
    symbol,
    interval: '1d',
    limit: 365,
  });

  return response.data;
};

module.exports = {
  API_ENDPOINT_FUTURES,
  WEBSOCKET_ENDPOINT_FUTURES,
  PATH_FOR_MULTIPLE_STREAMS,

  getExchangeInfo,
  get1dCandles,
  get1hCandles,
  get5mCandles,
};
