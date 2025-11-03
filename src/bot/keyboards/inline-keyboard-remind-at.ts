import TelegramBot from "node-telegram-bot-api";
import { buildCallbackData, CALLBACK_QUERY_ACTION } from "../../types";
import dayjs from "dayjs";

export const remindAtInlineKeyboard = (data: {
    day: string;
    month: string;
    year: string;
    timezone: string;
    productName: string;
}): TelegramBot.InlineKeyboardButton[][] => {
    const keyboard: TelegramBot.InlineKeyboardButton[][] = [[]];
    const hourDiff = dayjs()
        .tz(data.timezone)
        .date(Number(data.day))
        .month(Number(data.month))
        .year(Number(data.year))
        .startOf("day")
        .diff(dayjs(), "h");

    if (hourDiff > 24) {
        keyboard[0].push({
            text: "За 24 часа",
            callback_data: buildCallbackData(
                CALLBACK_QUERY_ACTION.CREATE_PRODUCT_AND_REMINDER,
                { ...data, hoursUntilExpire: String(24) }
            ),
        });
    }
    if (hourDiff > 12) {
        keyboard[0].push({
            text: "За 12 часов",
            callback_data: buildCallbackData(
                CALLBACK_QUERY_ACTION.CREATE_PRODUCT_AND_REMINDER,
                { ...data, hoursUntilExpire: String(12) }
            ),
        });
    }
    if (hourDiff > 6) {
        keyboard[0].push({
            text: "За 6 часов",
            callback_data: buildCallbackData(
                CALLBACK_QUERY_ACTION.CREATE_PRODUCT_AND_REMINDER,
                { ...data, hoursUntilExpire: String(6) }
            ),
        });
    }
    return keyboard;
};
