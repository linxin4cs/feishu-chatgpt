const ENV = require("./env");

const CONFIG = {
  app: {
    "chat-bot": {
      appId: ENV.CHAT_BOT.APP_ID,
      appSecret: ENV.CHAT_BOT.APP_SECRET,
      prompt: ENV.CHAT_BOT.PROMPT,
    },
  },

  baseURL: process.env.BASE_URL || "https://api.openai.com",
  apiKey: (ENV.OPEN_API_KEY ?? "").split(","),
  model: process.env.GPT_MODEL || "gpt-3.5-turbo",
};

module.exports = CONFIG;
