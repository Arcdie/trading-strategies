require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const helperenok = new TelegramBot(process.env.TELEGRAM_BOT_SECRET, { polling: false });

const sendMessage = (message) => helperenok.sendMessage(process.env.TELEGRAM_BOT_CHAT_ID, message);

module.exports = {
  sendMessage,
};
