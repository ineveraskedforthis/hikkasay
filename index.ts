import DDGS from "./duckai";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { casttemplate, hacktemplate, cthultemplate } from "./casttemplate";
import { generate_prompt, get_player, llm_player_parse_description } from "./game"
import dotenv from "dotenv";

// Загружаем переменные окружения из .env файла
dotenv.config();

// Получаем токен из переменных окружения
const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN is not defined in the environment variables");
}

const bot = new TelegramBot(token, {
  polling: {
    interval: 300, // Интервал опроса в миллисекундах
    autoStart: true, // Автоматический запуск бота
  },
});

// ID чата для отправки сообщений
// test -1002041281515
// tdoh -1001242433481
const chatId = -1001242433481;

// Получаем информацию о боте
let botId: number;

bot.getMe().then((me) => {
  botId = me.id; // Сохраняем ID бота
});

// Хикки запрос
bot.on("message", async (msg: Message) => {
  // Проверяем, что сообщение пришло из конкретного чата
  if (msg.chat.id !== chatId) {
    return; // Если чат не совпадает, выходим из функции
  }

  if (msg.text && msg.text.length > 0) {
    const messageText = msg.text.toString().toLowerCase();

    if (messageText.includes("хикки")) {
      const que = messageText.replace("хикки", "").trim();
      try {
        const ddgs = new DDGS();
        const response = await ddgs.chat(que, "gpt-4o-mini");
        bot.sendMessage(chatId, response, {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id,
        });
      } catch (error) {
        console.error(error);
        bot.sendMessage(
          chatId,
          "Произошла ошибка при обработке вашего запроса."
        );
      }
    }
  }
});

// Симуляция диалога
bot.on("message", async (msg: Message) => {
  // Проверяем, что сообщение пришло из конкретного чата
  if (msg.chat.id !== chatId) {
    return; // Если чат не совпадает, выходим из функции
  }

  if (
    msg.reply_to_message &&
    msg.reply_to_message.from &&
    msg.reply_to_message.from.id === botId
  ) {
    // Проверяем, что сообщение не от бота и что оно не является командой
    if (msg.from?.is_bot || msg.text?.startsWith("/")) {
      return;
    }

    const originalText = msg.reply_to_message.text;
    if (originalText && msg.text) {
      const prewAI = originalText;
      const userText = msg.text;

      try {
        const ddgs = new DDGS();
        const response = await ddgs.chat(
          `Прошлый твой ответ: ${prewAI}, а мой следующий вопрос: ${userText}`,
          "gpt-4o-mini"
        );
        await bot.sendMessage(chatId, response, {
          parse_mode: "Markdown",
          reply_to_message_id: msg.reply_to_message.message_id, // Используем правильный ID сообщения
        });
      } catch (error) {
        console.error(error);
        await bot.sendMessage(
          chatId,
          "Произошла ошибка при обработке вашего запроса."
        );
      }
    } else {
      console.log("Кисло пукнум");
    }
  }
});

// Каст запрос
bot.on("message", async (msg: Message) => {
  // Проверяем, что сообщение пришло из конкретного чата
  if (msg.chat.id !== chatId) {
    return; // Если чат не совпадает, выходим из функции
  }

  if (msg.text && msg.text.length > 0) {
    const messageText = msg.text.toString().toLowerCase();

    if (messageText.includes("каст")) {
      const que = messageText.replace("каст", "").trim();
      const req = casttemplate(que);
      try {
        const ddgs = new DDGS();
        const response = await ddgs.chat(req, "gpt-4o-mini");
        bot.sendMessage(chatId, response, {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id,
        });
        return
      } catch (error) {
        console.error(error);
        bot.sendMessage(
          chatId,
          "Произошла ошибка при обработке вашего запроса."
        );
      }
    }

    if (messageText.includes("хак")) {
      const que = messageText.replace("хак", "").trim();
      const req = hacktemplate(que);
      try {
        const ddgs = new DDGS();
        const response = await ddgs.chat(req, "gpt-4o-mini");
        bot.sendMessage(chatId, response, {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id,
        });
        return;
      } catch (error) {
        console.error(error);
        bot.sendMessage(
          chatId,
          "Произошла ошибка при обработке вашего запроса."
        );
      }
    }

    if (messageText.includes("ктул")) {
      const que = messageText.replace("ктул", "").trim();
      const req = cthultemplate(que);
      try {
        const ddgs = new DDGS();
        const response = await ddgs.chat(req, "gpt-4o-mini");
        bot.sendMessage(chatId, response, {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id,
        });
        return;
      } catch (error) {
        console.error(error);
        bot.sendMessage(
          chatId,
          "Произошла ошибка при обработке вашего запроса."
        );
      }
    }

    if (messageText.includes("путь2")) {
      const que = messageText.replace("путь2", "").trim();
      const from = msg.from
      if (from == undefined) {
        return;
      }
      var name = ""
      for (let i = 0; i < 10; i++) {
        name += Math.floor(Math.random() * 10)
      }
      const req = generate_prompt(get_player(from.id, name), que);
      console.log(req)
      try {
        const ddgs = new DDGS();
        const response = await ddgs.chat(req, "gpt-4o-mini");
        llm_player_parse_description(response)
        bot.sendMessage(chatId, response, {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id,
        });
        return;
      } catch (error) {
        console.error(error);
        bot.sendMessage(
          chatId,
          "Произошла ошибка при обработке вашего запроса."
        );
      }
    }
  }
});

// Удаление системных сообщений о входе/выходе
bot.on("message", async (msg: TelegramBot.Message) => {
  // Проверяем, что сообщение пришло из конкретного чата
  if (msg.chat.id !== chatId) {
    return; // Если чат не совпадает, выходим из функции
  }

  if (msg.left_chat_member) {
    try {
      await bot.deleteMessage(chatId, msg.message_id);
    } catch (err) {
      console.error(`Ошибка при удалении сообщения: ${err}`);
    }
  }

  if (msg.new_chat_members) {
    try {
      await bot.deleteMessage(chatId, msg.message_id);
    } catch (err) {
      console.error(`Ошибка при удалении сообщения: ${err}`);
    }
  }
});

console.log("Бот запущен...");
