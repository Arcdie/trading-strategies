const WebSocketClient = require('ws');

const {
  WEBSOCKET_ENDPOINT_FUTURES,
  PATH_FOR_MULTIPLE_STREAMS,
} = require('./binance');

const futuresConnectionUrl = `${WEBSOCKET_ENDPOINT_FUTURES}/${PATH_FOR_MULTIPLE_STREAMS}`;

module.exports = (symbols = [], onMessage) => {
  let sendPongInterval;
  let connectionUrl = futuresConnectionUrl;

  symbols.forEach((symbol) => connectionUrl += `${symbol.toLowerCase()}@kline_1h/`);
  connectionUrl = connectionUrl.substring(0, connectionUrl.length - 1);

  const websocketConnect = () => {
    let client = new WebSocketClient(connectionUrl);

    client.on('open', () => {
      console.log('Connection was opened');

      sendPongInterval = setInterval(() => {
        client.pong();
      }, 1000 * 60); // 1 minute
    });

    client.on('ping', () => {
      client.pong();
    });

    client.on('close', (message) => {
      log.info('Connection was closed');
      clearInterval(sendPongInterval);
      websocketConnect();
    });

    client.on('message', async bufferData => {
      const parsedData = JSON.parse(bufferData.toString());

      if (!parsedData.data || !parsedData.data.s) {
        console.log('No data', JSON.stringify(parsedData));
        return;
      }

      const {
        data: {
          s: symbol,
          k: {
            t: startTime,
            o: open,
            c: close,
            h: high,
            l: low,
            v: volume,
            x: isClosed,
          },
        },
      } = parsedData;

      const sendObj = {
        symbol,
        startTime: new Date(startTime),
        open: parseFloat(open),
        close: parseFloat(close),
        high: parseFloat(high),
        low: parseFloat(low),
        volume: parseFloat(volume),
        isClosed,
      };

      onMessage(sendObj);
    });
  };

  websocketConnect();
};