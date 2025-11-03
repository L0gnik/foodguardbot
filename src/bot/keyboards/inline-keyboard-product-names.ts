import TelegramBot from "node-telegram-bot-api";
import {
    buildCallbackData,
    CALLBACK_QUERY_ACTION,
    CALLBACK_QUERY_DATA,
} from "../../types";

export const listInlineKeyboard = <
    Action extends CALLBACK_QUERY_ACTION
>(
    action: Action,
    data: CALLBACK_QUERY_DATA[Action][],
    text: keyof CALLBACK_QUERY_DATA[Action]
): TelegramBot.InlineKeyboardButton[][] => {
    if (!data.length) return [];
    const keyboard: TelegramBot.InlineKeyboardButton[][] = [];

    data.forEach((item, index) => {
        if (index % 4 === 0) keyboard.push([]);

        keyboard[keyboard.length - 1].push({
            text: item[text],
            callback_data: buildCallbackData(action, item),
        });
    });
    return keyboard;
};
