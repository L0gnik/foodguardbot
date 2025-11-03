import TelegramBot from "node-telegram-bot-api";
import { CALLBACK_QUERY_ACTION } from "../../types";
import { onCallbackQuery } from "../handlers";
export const echoCommand = (bot: TelegramBot) => {
    onCallbackQuery(bot, CALLBACK_QUERY_ACTION.ECHO, (query, callbackData) => {
        const chat_id = query.message?.chat.id;
        if (chat_id) {
            const { message } = callbackData;
            bot.sendMessage(chat_id, message);
        }
    });
};
