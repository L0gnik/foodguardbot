import TelegramBot from "node-telegram-bot-api";
import { capitalizeFirst, getFirstDayOfMonth } from "../../utils";
import dayjs from "dayjs";
import { buildCallbackData, CALLBACK_QUERY_ACTION } from "../../types";

export const calendarInlineKeyboard = (
    month: number,
    year: number,
    productName: string,
    timezone: string = "Europe/Moscow"
): TelegramBot.InlineKeyboardButton[][] => {
    const date = dayjs().year(year).month(month).locale("ru");
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const totalDays = date.daysInMonth();
    const dayNames: TelegramBot.InlineKeyboardButton[] = [
        "Пн",
        "Вт",
        "Ср",
        "Чт",
        "Пт",
        "Сб",
        "Вс",
    ].map((item) => ({ text: item, callback_data: "NONE" }));
    const monthName: TelegramBot.InlineKeyboardButton[] = [
        {
            text: `${capitalizeFirst(
                date.month(month).format("MMMM")
            )} ${year}`,
            callback_data: "NONE",
        },
    ];
    const navigator: TelegramBot.InlineKeyboardButton[] = [
        {
            text: "<",
            callback_data: buildCallbackData(
                CALLBACK_QUERY_ACTION.CHANGE_CALENDAR_MONTH,
                {
                    previousMounth: String(month),
                    month: String(date.add(-1, "month").month()),
                    year: String(date.add(-1, "month").year()),
                    timezone,
                    productName,
                }
            ),
        },
        {
            text: " ",
            callback_data: "NONE",
        },
        {
            text: ">",
            callback_data: buildCallbackData(
                CALLBACK_QUERY_ACTION.CHANGE_CALENDAR_MONTH,
                {
                    previousMounth: String(month),
                    month: String(date.add(1, "month").month()),
                    year: String(date.add(1, "month").year()),
                    timezone,
                    productName,
                }
            ),
        },
    ];

    let dates: TelegramBot.InlineKeyboardButton[][] = [];
    let isStart = false;
    let isEnd = false;
    for (let i = 0; i < 6; i++) {
        let row: TelegramBot.InlineKeyboardButton[] = [];
        for (let j = 0; j < 7; j++) {
            const iteration = i * 7 + j + 1;
            if (iteration / firstDayOfMonth === 1) isStart = true;
            const day = iteration - firstDayOfMonth + 1;
            if (day > totalDays) isEnd = true;
            if (!isStart || isEnd) {
                row.push({
                    text: " ",
                    callback_data: "NONE",
                });
            } else {
                const today = dayjs().tz(timezone);

                const isToday =
                    today.date() === day &&
                    today.month() === month &&
                    today.year() === year;

                row.push({
                    text: `${isToday ? "🟢 " : ""}${day.toString()}`,
                    callback_data: buildCallbackData(
                        CALLBACK_QUERY_ACTION.ASK_PRODUCT_REMIND_DATE,
                        {
                            day: String(day),
                            month: String(month),
                            year: String(year),
                            productName,
                            timezone,
                        }
                    ),
                });
            }
        }
        dates.push(row);
    }

    return [monthName, dayNames, ...dates, navigator];
};
