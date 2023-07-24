// IMPORT MODULES / LIB
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import "dotenv/config";

// IMPORT SERVER FUNCTIONS
import { server } from "./server.js";

// RUN EXPRESS SERVER
server();

// SETUP THE BOT
const bot = new TelegramBot(`${process.env.TOKEN}` || ``, { polling: true });

// SETUP THE COMMANDS
const commands = [
  {
    command: "start",
    description: "active bot & server.",
    regexp: /\/start/,
  },
];

// EVENTS In CHAT

// Keyboards
// const keyboards = {
//   reply_markup: {
//     keyboard: [["Yes", "No"]],
//     resize_keyboard: true,
//     one_time_keyboard: true,
//     force_reply: true,
//   },
// };

// Welcome Message
bot.onText(commands[0].regexp, (msg) => {
  const chat_id = msg.chat.id;
  bot.sendMessage(chat_id, `service is actived.`);
  bot.sendMessage(
    chat_id,
    `Welcome Dear ⚕️\n\n🔗 Send your Link and waiting for shorten.\n-------------------\n🚫 The link must start with "https://"`
  );
});

// SEND THE SHORTENED URL
bot.on("message", async (msg) => {
  // Check if the message contains a link
  if (isUrl(msg.text)) {
    // Shorten the link using RapidAPI
    const shortenedUrl = await shortenUrl(msg.text);
    // waiting message
    bot.sendMessage(msg.chat.id, "♻️ Processing...");
    // Re-send the shortened link to the user
    try {
      bot.sendMessage(msg.chat.id, "✅️ Your shortened URL here.");
      await bot.sendMessage(msg.chat.id, shortenedUrl);
    } catch (error) {
      bot.sendMessage(msg.chat.id, "⛔️ Failed... try again after 5 seconds..");
    }
  } else {
    // If the message is not a URL, send a reply message to guide the user
    if (msg.text !== "/start") {
      bot.sendMessage(
        msg.chat.id,
        "🚫 The message you sent is not a valid URL. Please send a valid URL.",
        { reply_to_message_id: msg.message_id }
      );
    }
  }
});

// EVENTS In CHAT //

// FUNCTIONS

// Check URL
const isUrl = (text) => {
  const regex =
    /^(http|https):\/\/[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\.[a-z]{2,63}$/;
  return regex.test(text);
};

// POST URL TO RAPID API
const shortenUrl = async (url) => {
  const encodedParams = new URLSearchParams();
  encodedParams.set("url", url);

  const options = {
    method: "POST",
    url: "https://url-shortener-service.p.rapidapi.com/shorten",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "X-RapidAPI-Key": `${process.env.RAPI_TOKEN}`,
      "X-RapidAPI-Host": "url-shortener-service.p.rapidapi.com",
    },
    data: encodedParams,
  };

  try {
    const response = await axios.request(options);
    const data = response.data;
    console.log(data);
    return data.result_url;
  } catch (error) {
    console.error(error);
  }
};

// FUNCTIONS //

// POLLING THE BOT
bot.setMyCommands(commands);
bot.on("polling_error", console.log);
